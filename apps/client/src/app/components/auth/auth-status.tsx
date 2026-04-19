"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthUser } from "@/app/lib/auth";

type AuthStatusProps = {
  user: AuthUser | null;
};

export function AuthStatus({ user }: AuthStatusProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <Link className="text-accent-teal" href="/login">
          Login
        </Link>
        <Link
          className="pressable-pink inline-flex min-h-10 items-center justify-center border-2 border-black bg-accent-pink px-4 text-[#140812]"
          href="/signup"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
      <Link className="hidden text-accent-teal sm:inline" href="/dashboard">
        {user.username}
      </Link>
      <button
        className="pressable-teal inline-flex min-h-10 items-center justify-center border-2 border-black bg-accent-teal px-4 text-[#081312] disabled:cursor-wait disabled:opacity-70"
        disabled={isLoggingOut}
        onClick={logout}
        type="button"
      >
        {isLoggingOut ? "Leaving" : "Logout"}
      </button>
    </div>
  );
}
