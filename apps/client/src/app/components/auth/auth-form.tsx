"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";
  const safeNextPath = sanitizeNextPath(nextPath);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get("username") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      ...(isSignup
        ? { nametag: String(formData.get("nametag") ?? "").trim() || undefined }
        : {}),
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      const message = Array.isArray(body?.message)
        ? body.message[0]
        : body?.message;
      setError(message ?? "Something went wrong. Try again.");
      setIsSubmitting(false);
      return;
    }

    router.push(safeNextPath);
    router.refresh();
  }

  return (
    <form
      className="panel-shadow w-full border-2 border-black bg-surface-strong px-5 py-7 sm:px-8"
      onSubmit={submit}
    >
      <div className="space-y-5">
        <label className="block">
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent-teal">
            Username
          </span>
          <input
            autoComplete="username"
            className="mt-2 h-13 w-full border-2 border-border bg-background px-4 font-display text-base font-bold text-foreground outline-none transition focus:border-accent-teal"
            maxLength={24}
            minLength={3}
            name="username"
            required
            type="text"
          />
        </label>

        {isSignup ? (
          <label className="block">
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent-yellow">
              Nametag
            </span>
            <input
              autoComplete="off"
              className="mt-2 h-13 w-full border-2 border-border bg-background px-4 font-display text-base font-bold uppercase text-foreground outline-none transition focus:border-accent-yellow"
              maxLength={12}
              name="nametag"
              type="text"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent-pink">
            Password
          </span>
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="mt-2 h-13 w-full border-2 border-border bg-background px-4 font-display text-base font-bold text-foreground outline-none transition focus:border-accent-pink"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-5 border-2 border-accent-pink bg-accent-pink/10 px-4 py-3 text-sm font-semibold text-accent-pink">
          {error}
        </p>
      ) : null}

      <button
        className="pressable-pink font-display mt-7 inline-flex min-h-13 w-full items-center justify-center border-2 border-black bg-accent-pink px-6 text-base font-bold uppercase text-[#140812] disabled:cursor-wait disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? isSignup
            ? "Creating"
            : "Entering"
          : isSignup
            ? "Create Account"
            : "Enter Dashboard"}
      </button>

      <p className="mt-5 text-center text-sm font-semibold text-muted">
        {isSignup ? "Already queued?" : "Need a handle?"}{" "}
        <Link
          className="text-accent-teal"
          href={`${isSignup ? "/login" : "/signup"}?next=${encodeURIComponent(safeNextPath)}`}
        >
          {isSignup ? "Login" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}

function sanitizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}
