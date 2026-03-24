import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { TimerProvider } from "@/components/TimerProvider";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Header } from "@/components/Header";
import { AiMentor } from "@/components/AiMentor";
import { ParticleBackground } from "@/components/ParticleBackground";

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
  title: "VoltAi — GATE EC 2027",
  description: "Your AI-powered gateway to mastering GATE EC 2027.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ scrollBehavior: "smooth" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-[#020005] text-[#e8ecf5]`}
      >
        <ParticleBackground />
        <ProgressProvider>
          <TimerProvider>
            <Header />
            <AiMentor />
            <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
          </TimerProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
