import { scoreRaceEntries } from "./data";
import { SectionTitle } from "./section-title";

export function CompetitiveSnapshotSection() {
  return (
    <section
      id="snapshot"
      className="border-t-4 border-surface-strong px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionTitle className="text-accent-teal">Score Race</SectionTitle>
          <h2 className="font-display mt-4 text-4xl font-bold uppercase italic text-foreground sm:text-5xl">
            One rack can flip the whole room.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
            QTime turns word finding into a pressure clock. A clean rack can steal
            the lead, but the next player only needs one sharper answer to drag the
            duel back from the edge.
          </p>
        </div>

        <div className="panel-shadow border-2 border-border bg-surface px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
                Live Duel Snapshot
              </p>
              <p className="font-display mt-2 text-2xl font-bold uppercase italic text-foreground">
                First To 500
              </p>
            </div>
            <div className="border border-accent-yellow bg-accent-yellow/10 px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Turn
              </p>
              <p className="font-display text-2xl font-bold text-accent-yellow">08</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {scoreRaceEntries.map((entry) => (
              <article key={entry.player} className={`border-2 px-4 py-4 ${entry.className}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-bold uppercase italic">
                      {entry.player}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                      Last swing {entry.delta}
                    </p>
                  </div>
                  <p className="font-display text-4xl font-bold">{entry.score}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tiles.map((tile) => (
                    <span
                      key={`${entry.player}-${tile}`}
                      className="flex h-9 w-9 items-center justify-center border border-border bg-background font-display text-sm font-bold text-foreground"
                    >
                      {tile}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
