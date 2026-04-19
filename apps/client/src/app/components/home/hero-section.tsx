import { floatingAccents } from "./data";

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden px-5 py-18 sm:px-8 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        {floatingAccents.map((accent) => (
          <div key={accent.className} className={accent.className}>
            {accent.content}
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="neon-frost border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          Live Matchmaking Word Duels
        </div>
        <h1 className="font-display mt-10 bg-linear-[135deg,var(--accent-pink),#e30071_58%,var(--accent-teal)] bg-clip-text text-6xl leading-none font-bold uppercase italic text-transparent sm:text-8xl lg:text-[7.25rem]">
          QTIME
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold text-foreground sm:text-2xl">
          A no-board word duel where the highest scoring answer owns the turn.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          Turn your rack into the best word you can find, crack the score race wide
          open, and reach 500 before your rival flips the duel.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            className="pressable-pink font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-pink px-8 py-4 text-base font-bold uppercase text-[#0b0e14]"
            href="/signup"
          >
            Play Now
          </a>
          <a
            className="font-display inline-flex min-h-13 items-center justify-center border-2 border-border bg-surface-strong px-8 py-4 text-base font-bold uppercase text-foreground"
            href="#flow"
          >
            Watch Match Flow
          </a>
        </div>
      </div>
    </section>
  );
}
