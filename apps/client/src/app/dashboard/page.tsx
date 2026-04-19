import Link from "next/link";
import { requireUser } from "@/app/lib/auth";

const statTiles = [
  { label: "Rating", value: "1200", tone: "text-accent-teal" },
  { label: "Wins", value: "0", tone: "text-accent-pink" },
  { label: "Win Rate", value: "--", tone: "text-accent-yellow" },
  { label: "Best Word", value: "TBD", tone: "text-accent-green" },
];

const recentMatches = [
  { opponent: "Waiting Room", result: "No matches yet", score: "--" },
  { opponent: "Queue Preview", result: "Coming soon", score: "--" },
  { opponent: "Rating History", result: "Coming soon", score: "--" },
];

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
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

      <section className="mx-auto w-full max-w-7xl py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent-yellow">
              Player Dashboard
            </p>
            <h1 className="font-display mt-4 text-5xl leading-none font-bold uppercase italic text-foreground sm:text-7xl">
              {user.username}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {user.nametag
                ? `${user.nametag} is locked in.`
                : "Your QTime profile is ready."}{" "}
              Match stats, rating history, and queue state can land here as the
              backend grows.
            </p>
          </div>

          <div className="panel-shadow border-2 border-black bg-surface-strong px-6 py-7">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-teal">
              Next Action
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold uppercase italic text-foreground">
              Queue Flow Soon.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Play the local pass-and-play duel now, then bring the result back
              into matchmaking once the backend contracts land.
            </p>
            <Link
              className="pressable-teal font-display mt-5 inline-flex min-h-12 items-center justify-center border-2 border-black bg-accent-teal px-5 text-sm font-bold uppercase text-[#081312]"
              href="/game"
            >
              Play Local Duel
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statTiles.map((tile) => (
            <div
              className="border-2 border-border bg-surface px-5 py-6"
              key={tile.label}
            >
              <p className={`font-display text-4xl font-bold ${tile.tone}`}>
                {tile.value}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                {tile.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border-2 border-border bg-surface-strong px-5 py-6 sm:px-7">
            <h2 className="font-display text-2xl font-bold uppercase italic text-foreground">
              Recent Matches
            </h2>
            <div className="mt-5 divide-y divide-border">
              {recentMatches.map((match) => (
                <div
                  className="grid grid-cols-[1fr_auto] gap-4 py-4"
                  key={match.opponent}
                >
                  <div>
                    <p className="font-display text-base font-bold text-foreground">
                      {match.opponent}
                    </p>
                    <p className="mt-1 text-sm text-muted">{match.result}</p>
                  </div>
                  <p className="font-display text-lg font-bold text-accent-pink">
                    {match.score}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-2 border-border bg-surface px-5 py-6 sm:px-7">
            <h2 className="font-display text-2xl font-bold uppercase italic text-foreground">
              Rating Path
            </h2>
            <div className="mt-6 flex min-h-48 items-end gap-3">
              {[34, 48, 42, 62, 58, 74, 68].map((height, index) => (
                <div
                  className="flex flex-1 flex-col items-center gap-3"
                  key={height}
                >
                  <div
                    className="w-full border-2 border-accent-teal bg-accent-teal/20"
                    style={{ height }}
                  />
                  <span className="text-[10px] font-bold text-muted">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
