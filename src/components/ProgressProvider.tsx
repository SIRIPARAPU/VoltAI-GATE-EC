"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

type TopicProgress = {
  attempts: number;
  correct: number;
  mistakes: number;
};

type ProgressState = {
  lectures: Record<string, Record<string, boolean>>; // subjectId -> videoId -> done
  topics: Record<string, TopicProgress>; // topicId -> progress
  weeklyActivity: Record<string, number>; // "YYYY-MM-DD" -> questions answered
};

const defaultState: ProgressState = {
  lectures: {},
  topics: {},
  weeklyActivity: {},
};

type ProgressContextType = {
  progress: ProgressState;
  markLecture: (subjectId: string, videoId: string, done: boolean) => void;
  recordPractice: (topicId: string, isCorrect: boolean) => void;
  getSubjectProgress: (subjectId: string, totalLectures: number) => { completed: number; total: number; percent: number };
  getTopicAccuracy: (topicId: string) => number;
  clearProgress: () => void;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

const STORAGE_KEY = "gate_ai_progress_v1";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setProgress({
          lectures: p.lectures || {},
          topics: p.topics || {},
          weeklyActivity: p.weeklyActivity || {},
        });
      } catch (e) {}
    }
    setLoaded(true);
  }, []);

  const save = (newState: ProgressState) => {
    setProgress(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const markLecture = (subjectId: string, videoId: string, done: boolean) => {
    setProgress((prev) => {
      const subj = prev.lectures[subjectId] || {};
      const newSubj = { ...subj, [videoId]: done };
      // cleanup if false
      if (!done) delete newSubj[videoId];
      
      const newState = {
        ...prev,
        lectures: { ...prev.lectures, [subjectId]: newSubj },
      };
      save(newState);
      return newState;
    });
  };

  const recordPractice = (topicId: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const top = prev.topics[topicId] || { attempts: 0, correct: 0, mistakes: 0 };
      const today = new Date().toISOString().split("T")[0];
      const currentActivity = prev.weeklyActivity[today] || 0;

      const newState = {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: {
            attempts: top.attempts + 1,
            correct: top.correct + (isCorrect ? 1 : 0),
            mistakes: top.mistakes + (isCorrect ? 0 : 1),
          },
        },
        weeklyActivity: {
          ...prev.weeklyActivity,
          [today]: currentActivity + 1,
        },
      };
      save(newState);
      return newState;
    });
  };

  const getSubjectProgress = (subjectId: string, totalLectures: number) => {
    const subj = progress.lectures[subjectId] || {};
    const completed = Object.keys(subj).filter(k => subj[k]).length;
    return {
      completed,
      total: totalLectures,
      percent: totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0,
    };
  };

  const getTopicAccuracy = (topicId: string) => {
    const top = progress.topics[topicId];
    if (!top || top.attempts === 0) return 0;
    return Math.round((top.correct / top.attempts) * 100);
  };

  const clearProgress = () => {
    save(defaultState);
  };

  const value = useMemo(
    () => ({ progress, markLecture, recordPractice, getSubjectProgress, getTopicAccuracy, clearProgress }),
    [progress]
  );

  // don't render children until loaded to prevent hydration mismatch if using localstorage directly in renders
  if (!loaded) return <>{children}</>;

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

const fallback: ProgressContextType = {
  progress: defaultState,
  markLecture: () => {},
  recordPractice: () => {},
  getSubjectProgress: () => ({ completed: 0, total: 0, percent: 0 }),
  getTopicAccuracy: () => 0,
  clearProgress: () => {},
};

export function useProgress() {
  const ctx = useContext(ProgressContext);
  // During SSR / static prerender the provider isn't mounted yet → return safe defaults
  return ctx ?? fallback;
}
