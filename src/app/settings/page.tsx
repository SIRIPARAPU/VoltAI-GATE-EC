import Link from "next/link";
import { ApiKeySettings } from "@/components/ApiKeySettings";

export default function SettingsPage() {
  return (
    <main
      className="mx-auto min-h-screen max-w-5xl px-4 py-8"
    >
      {/* Header row */}
      <div className="mb-8 fade-up">
        <Link href="/" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </Link>

        <h1
          className="mt-3 text-2xl font-bold tracking-tight fade-up fade-up-delay-1"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span className="text-gradient-neon">Settings</span>
        </h1>
        <p
          className="mt-1 text-sm fade-up fade-up-delay-2"
          style={{ color: "rgba(148, 163, 184, 0.75)" }}
        >
          Configure your AI key for notes and practice generation.
        </p>
      </div>

      <div className="fade-up fade-up-delay-3">
        <ApiKeySettings />
      </div>
    </main>
  );
}
