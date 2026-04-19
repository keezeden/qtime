import { featureCards, flowSteps, leaderboardEntries } from "./data";
import { SectionTitle } from "./section-title";

function FeatureCardHeader({ variant }: { variant: "bolt" | "tiles" }) {
  if (variant === "bolt") {
    return (
      <div className="mb-8 flex h-28 items-center justify-center bg-background">
        <div className="h-4 w-18 -translate-x-6 bg-accent-teal" />
        <div className="ml-5 flex h-18 w-18 items-center justify-center bg-surface text-6xl text-accent-teal">
          !
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex items-center gap-2">
      {["A", "B", "C"].map((letter, index) => (
        <div
          key={letter}
          className={[
            "flex h-10 w-10 items-center justify-center border border-[#481227] font-display font-bold",
            index === 0 ? "bg-[#f9bbd0]" : index === 1 ? "bg-[#ffe77d]" : "bg-[#7df9df]",
          ].join(" ")}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

function FeatureCardItem({
  title,
  description,
  className,
  headerVariant,
  descriptionClassName,
}: (typeof featureCards)[number]) {
  return (
    <article className={className}>
      <FeatureCardHeader variant={headerVariant} />
      <div className="font-display text-2xl font-bold uppercase italic">{title}</div>
      <p className={`mt-4 max-w-sm leading-7 ${descriptionClassName ?? "text-sm text-muted"}`}>
        {description}
      </p>
    </article>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <SectionTitle className="text-accent-teal">Game Features</SectionTitle>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {featureCards.map((card) => (
            <FeatureCardItem key={card.title} {...card} />
          ))}

          <article
            id="flow"
            className="panel-shadow border-2 border-border bg-surface px-6 py-7 lg:col-span-2"
          >
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <SectionTitle className="text-accent-yellow">Match Flow</SectionTitle>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                  Every turn is a compact race: read the rack, build the best word,
                  score hard, and push the duel toward 500 before the answer lands.
                </p>
                <a
                  className="pressable-teal font-display mt-6 inline-flex min-h-12 items-center justify-center border-2 border-black bg-accent-teal px-5 py-3 text-sm font-bold uppercase text-[#071110]"
                  href="#matchmaking"
                >
                  View Matchmaking
                </a>
              </div>

              <div className="space-y-3">
                {leaderboardEntries.map((entry) => (
                  <div key={entry.rank} className="border border-border bg-background px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          {entry.rank}
                        </span>
                        <span className="font-display text-sm font-bold uppercase text-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <span
                        className={`font-display text-sm font-bold uppercase ${entry.scoreClassName}`}
                      >
                        {entry.score}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="grid gap-3 sm:grid-cols-4">
                  {flowSteps.map((step) => (
                    <div
                      key={step.label}
                      className="border border-border bg-surface-strong px-4 py-4 text-center"
                    >
                      <div className={`font-display text-4xl font-bold ${step.valueClassName}`}>
                        {step.value}
                      </div>
                      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {step.label}
                      </div>
                      <p className="mt-3 min-h-16 text-xs leading-5 text-muted">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
