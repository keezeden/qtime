import { ctaButtons } from "./data";

export function CtaSection() {
  return (
    <section id="cta" className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="panel-shadow mx-auto w-full max-w-5xl border-2 border-black bg-linear-[135deg,#1b1f2b,#2a2230] px-6 py-10 text-center sm:px-10 sm:py-16">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent-yellow">
          Ready To Queue?
        </p>
        <h2 className="font-display mt-4 text-4xl font-bold uppercase italic text-foreground sm:text-7xl">
          Hit The Next Duel.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
          Jump into the word race, learn the rack loop, and get ready for the
          matchmaking-driven client.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {ctaButtons.map((button) => (
            <a key={button.label} className={button.className} href={button.href}>
              {button.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
