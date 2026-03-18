import Link from "next/link";
import { ApiKeySettings } from "@/components/ApiKeySettings";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-zinc-300 hover:text-zinc-100">
          ← Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-300">Configure your AI key for notes and practice generation.</p>
      </div>

      <ApiKeySettings />
    </main>
  );
}

