"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { MathText } from "@/components/MathText";
import { getStoredAiConfig } from "@/components/ApiKeySettings";
import { getSubject, SubjectId } from "@/data/subjects";
import { getTopics } from "@/data/syllabus";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputObj, setInputObj] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Extract context from pathname
  const context = useMemo(() => {
    let subjectName = "General";
    let topicTitle = "General";
    
    if (pathname && pathname.startsWith("/subject/")) {
      const parts = pathname.split("/");
      const subjectId = parts[2];
      const subject = getSubject(subjectId);
      if (subject) {
        subjectName = subject.name;
        if (parts[3] === "topic" && parts[4]) {
          const topicId = parts[4];
          const topic = getTopics(subjectId as SubjectId).find(t => t.id === topicId);
          if (topic) {
            topicTitle = topic.title;
          }
        }
      }
    }
    return { subjectName, topicTitle };
  }, [pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputObj.trim() || loading) return;

    const userText = inputObj.trim();
    setInputObj("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    const cfg = getStoredAiConfig();
    if (!cfg.apiKey?.trim()) {
      setMessages([...newMessages, { role: "assistant", content: "Missing API key. Please configure it in Settings." }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          model: cfg.model,
          provider: cfg.provider,
          mode: "chat",
          subject: context.subjectName,
          topic: context.topicTitle,
          chatHistory: newMessages,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to connect to AI Mentor");
      
      setMessages([...newMessages, { role: "assistant", content: json.text }]);
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unknown error";
      setMessages([...newMessages, { role: "assistant", content: `Error: ${err}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Do not show mentor on Settings or World page
  if (pathname === "/settings" || pathname === "/world") return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-[#0a0a0a]/85 border border-white/10"
            style={{
              position: "fixed",
              bottom: "5.5rem",
              right: "1.5rem",
              width: "calc(100vw - 3rem)",
              maxWidth: "360px",
              height: "500px",
              maxHeight: "75vh",
              zIndex: 9999,
              borderRadius: "1.25rem",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2), 0 0 20px rgba(109,40,217,0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="bg-transparent border-b border-white/5"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #22d3ee)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 10px rgba(124,58,237,0.5)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                    <path d="M12 12 2.1 7.1"/>
                    <path d="M12 12l9.9 4.9"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[#f1f5f9]" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}>GATE AI Mentor</div>
                  <div className="text-slate-400/80" style={{ fontSize: "0.7rem" }}>
                    {context.topicTitle !== "General" ? `Context: ${context.topicTitle}` : context.subjectName !== "General" ? `Context: ${context.subjectName}` : "Global Context"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="active-compress text-white/50 hover:text-white"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {messages.length === 0 && (
                <div className="text-slate-400/60" style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "2rem" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", opacity: 0.5 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p>I am your GATE EC Mentor.</p>
                  <p style={{ marginTop: "0.25rem" }}>Ask me any concept or doubt!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === "user" ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white" : "bg-white/5 border border-white/5 text-[#f1f5f9]"}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "0.75rem 1rem",
                    borderRadius: "1rem",
                    borderBottomRightRadius: msg.role === "user" ? "0.25rem" : "1rem",
                    borderBottomLeftRadius: msg.role === "assistant" ? "0.25rem" : "1rem",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  <MathText text={msg.content} />
                </div>
              ))}
              {loading && (
                <div className="bg-white/5" style={{ alignSelf: "flex-start", padding: "0.75rem 1rem", borderRadius: "1rem", borderBottomLeftRadius: "0.25rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", animation: "neonPulse 1s ease-in-out infinite" }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-black/30 border-t border-white/5" style={{ padding: "0.75rem" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={inputObj}
                  onChange={(e) => setInputObj(e.target.value)}
                  placeholder="Ask a question..."
                  className="input-neon bg-[#050505] text-white border border-white/10"
                  style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.85rem", borderRadius: "99px" }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputObj.trim()}
                  className="btn-primary active-compress"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    padding: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: inputObj.trim() && !loading ? 1 : 0.5,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="active-compress"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #22d3ee)",
          border: "none",
          boxShadow: "0 4px 20px rgba(124,58,237,0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
          color: "white",
          cursor: "pointer",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></motion.svg>
          ) : (
            <motion.svg key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 11V7"/><path d="M9 11l3-1.5L15 11"/></motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
