import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { TimerProvider } from "@/components/TimerProvider";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Header } from "@/components/Header";
import { AiMentor } from "@/components/AiMentor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VoltAI — GATE EC Command Center",
  description: "Your AI-powered gateway to mastering GATE EC 2027.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ProgressProvider>
          <TimerProvider>
            <Header />
            <AiMentor />
            {children}
          </TimerProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
