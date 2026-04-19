import { matchmakingCards } from "./data";
import { SectionTitle } from "./section-title";

export function MatchmakingSection() {
  return (
    <section id="matchmaking" className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionTitle className="text-accent-yellow">Matchmaking Pressure</SectionTitle>
            <h2 className="font-display mt-4 text-4xl font-bold uppercase italic text-foreground sm:text-5xl">
              Better pairings keep the score race nasty.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              The systems side stays mostly invisible. What you feel is quick pairing,
              tighter skill bands, and rematches that keep tempo high instead of
              wasting time in weak queues.
            </p>
          </div>

          <div className="grid gap-4">
            {matchmakingCards.map((card) => (
              <article key={card.title} className={card.className}>
                <div className={`font-display text-2xl font-bold uppercase ${card.titleClassName}`}>
                  {card.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
