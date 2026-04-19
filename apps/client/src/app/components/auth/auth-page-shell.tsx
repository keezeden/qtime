import Link from "next/link";
import { AuthForm } from "./auth-form";

type AuthPageShellProps = {
  mode: "login" | "signup";
  nextPath: string;
};

export function AuthPageShell({ mode, nextPath }: AuthPageShellProps) {
  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl"
          href="/"
        >
          QTime
        </Link>
        <Link
          className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent-teal"
          href="/"
        >
          Home
        </Link>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent-yellow">
            {isSignup ? "Claim Your Handle" : "Back In The Queue"}
          </p>
          <h1 className="font-display mt-4 text-5xl leading-none font-bold uppercase italic text-foreground sm:text-7xl">
            {isSignup ? "Build Your Duel Identity." : "Return To The Arena."}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
            {isSignup
              ? "Pick a username, add an optional tag, and step into the first dashboard pass for QTime."
              : "Use your QTime username to reach the protected player dashboard and keep the session fresh."}
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["ELO", "WINS", "STREAK"].map((label, index) => (
              <div
                className="border-2 border-border bg-surface px-4 py-5 text-center"
                key={label}
              >
                <p className="font-display text-2xl font-bold text-accent-teal">
                  {index === 0 ? "1200" : "0"}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AuthForm mode={mode} nextPath={nextPath} />
      </section>
    </main>
  );
}
