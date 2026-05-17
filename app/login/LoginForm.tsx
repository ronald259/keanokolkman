"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";

export default function LoginForm({ from, initialError }: { from?: string; initialError?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError || "");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await loginAction(password, from);
      if (res.ok) {
        router.replace(res.redirect);
      } else {
        setError(res.error);
        setPassword("");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-sm text-[var(--color-muted)]">Wachtwoord</span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full bg-white/5 border border-white/15 focus:border-[var(--color-accent)] focus:outline-none rounded-lg px-4 py-3 text-lg tracking-wide transition"
          placeholder="••••••••"
          disabled={pending}
        />
      </label>

      {error && (
        <div className="text-sm text-red-300 bg-red-950/50 border border-red-900/60 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending || !password} className="btn btn-primary w-full text-lg disabled:opacity-50">
        {pending ? "Een moment…" : "Toegang"}
      </button>

      <p className="text-xs text-[var(--color-muted)] text-center">
        Tip: gebruik het beheerderswachtwoord om naar het admin-paneel te gaan.
      </p>
    </form>
  );
}
