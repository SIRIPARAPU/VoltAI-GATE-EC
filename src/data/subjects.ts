export type SubjectId =
  | "maths"
  | "aptitude"
  | "analog"
  | "emft"
  | "digital"
  | "network-theory"
  | "edc"
  | "communication"
  | "control-systems"
  | "signals-systems";

export type Subject = {
  id: SubjectId;
  name: string;
  playlistUrl: string;
};

export const SUBJECTS: Subject[] = [
  {
    id: "maths",
    name: "Engineering Mathematics",
    playlistUrl:
      "https://www.youtube.com/watch?v=G31sMtUkjKM&list=PLR7krO3VHssTi9FnJdr0IIKyDUESLF1h0",
  },
  {
    id: "aptitude",
    name: "General Aptitude",
    playlistUrl:
      "https://www.youtube.com/watch?v=1WPjyhWVd98&list=PLR7krO3VHssT4ZZ1AagIAkeONUGUv6Rjz",
  },
  {
    id: "analog",
    name: "Analog Circuits",
    playlistUrl:
      "https://www.youtube.com/watch?v=XG3cVoUh7wc&list=PLs5_Rtf2P2r674CTMNJ3odeHk9Wtb-WWl",
  },
  {
    id: "emft",
    name: "Electromagnetics (EMFT)",
    playlistUrl: "https://www.youtube.com/playlist?list=PL3eEXnCBViH8lKOXZeghNfHmr2C8FNldP",
  },
  {
    id: "digital",
    name: "Digital Circuits",
    playlistUrl:
      "https://www.youtube.com/watch?v=MTpg1Egq6PM&list=PLR7krO3VHssS2rKksstCXwB5B13CXcQqd",
  },
  {
    id: "network-theory",
    name: "Network Theory",
    playlistUrl:
      "https://www.youtube.com/watch?v=9UXRwXmdvRs&list=PLR7krO3VHssS9lW_L0s2XvPO4O1JuWWky",
  },
  {
    id: "edc",
    name: "Electronic Devices",
    playlistUrl: "https://www.youtube.com/playlist?list=PLs5_Rtf2P2r75okkE2V9oXbwJI-8m-63Q",
  },
  {
    id: "communication",
    name: "Communication Systems",
    playlistUrl: "https://www.youtube.com/playlist?list=PL3eEXnCBViH_GnwysR_wVeMaErPXpyb8y",
  },
  {
    id: "control-systems",
    name: "Control Systems",
    playlistUrl:
      "https://www.youtube.com/watch?v=F5HxNSm79mQ&list=PLs5_Rtf2P2r4r0h0VT5gn36f1_PXjok-c",
  },
  {
    id: "signals-systems",
    name: "Signals & Systems",
    playlistUrl:
      "https://www.youtube.com/watch?v=FGhunLDXRy4&list=PLR7krO3VHssSsUoMzIyYrUre_dM4M9LfI",
  },
];

export function getSubject(subjectId: string) {
  return SUBJECTS.find((s) => s.id === subjectId);
}

