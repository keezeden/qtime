import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/app/lib/auth";

const API_URL = process.env.QTIME_API_URL ?? "http://localhost:3000";

type MatchHistoryItem = {
  id: number;
  opponentName: string;
  result: string | null;
  ratingDelta: number | null;
  oldRating: number | null;
  newRating: number | null;
  finishedAt: string | null;
  finalScore: number | null;
  opponentScore: number | null;
};

type MatchHistoryResponse = {
  summary: {
    rating: number;
    wins: number;
    losses: number;
    totalMatches: number;
    winRate: number | null;
  };
  matches: MatchHistoryItem[];
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const history = await fetchMatchHistory();
  const statTiles = [
    { label: "Rating", value: `${history.summary.rating}`, tone: "text-accent-teal" },
    { label: "Wins", value: `${history.summary.wins}`, tone: "text-accent-pink" },
    { label: "Win Rate", value: formatWinRate(history.summary.winRate), tone: "text-accent-yellow" },
    { label: "Matches", value: `${history.summary.totalMatches}`, tone: "text-accent-green" },
  ];
  const ratingPath = createRatingPath(history.matches, history.summary.rating);

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
              Track your rating movement and recent word-duel results.
            </p>
          </div>

          <div className="panel-shadow border-2 border-black bg-surface-strong px-6 py-7">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-teal">
              Next Action
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold uppercase italic text-foreground">
              Queue for Duel.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Enter matchmaking, wait for a paired opponent, then play through
              the persisted multiplayer state loop.
            </p>
            <Link
              className="pressable-teal font-display mt-5 inline-flex min-h-12 items-center justify-center border-2 border-black bg-accent-teal px-5 text-sm font-bold uppercase text-[#081312]"
              href="/game"
            >
              Queue Multiplayer
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
              {history.matches.length ? history.matches.map((match) => (
                <div
                  className="grid grid-cols-[1fr_auto] gap-4 py-4"
                  key={match.id}
                >
                  <div>
                    <p className="font-display text-base font-bold text-foreground">
                      {match.opponentName}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {formatResult(match.result)} / {formatScore(match)}
                    </p>
                  </div>
                  <p className={`font-display text-lg font-bold ${getDeltaTone(match.ratingDelta)}`}>
                    {formatDelta(match.ratingDelta)}
                  </p>
                </div>
              )) : (
                <p className="py-6 text-sm font-semibold text-muted">No completed matches yet.</p>
              )}
            </div>
          </section>

          <section className="border-2 border-border bg-surface px-5 py-6 sm:px-7">
            <h2 className="font-display text-2xl font-bold uppercase italic text-foreground">
              Rating Path
            </h2>
            <div className="mt-6 flex min-h-48 items-end gap-3">
              {ratingPath.map((point, index) => (
                <div
                  className="flex flex-1 flex-col items-center gap-3"
                  key={`${point.rating}-${index}`}
                >
                  <div
                    className="w-full border-2 border-accent-teal bg-accent-teal/20"
                    style={{ height: point.height }}
                    title={`Rating ${point.rating}`}
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

async function fetchMatchHistory(): Promise<MatchHistoryResponse> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_URL}/matches/history`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load match history: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as MatchHistoryResponse;
}

function createRatingPath(matches: MatchHistoryItem[], currentRating: number): { rating: number; height: number }[] {
  const ratings = [...matches].reverse().map((match) => match.newRating).filter((rating): rating is number => rating !== null);
  const path = ratings.length ? ratings : [currentRating];
  const min = Math.min(...path);
  const max = Math.max(...path);
  const span = Math.max(1, max - min);

  return path.slice(-8).map((rating) => ({
    rating,
    height: 40 + Math.round(((rating - min) / span) * 100),
  }));
}

function formatWinRate(winRate: number | null): string {
  return winRate === null ? "--" : `${winRate}%`;
}

function formatResult(result: string | null): string {
  if (result === "WIN") return "Win";
  if (result === "LOSS") return "Loss";
  return "Result pending";
}

function formatScore(match: MatchHistoryItem): string {
  if (match.finalScore === null || match.opponentScore === null) return "--";
  return `${match.finalScore}-${match.opponentScore}`;
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "--";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function getDeltaTone(delta: number | null): string {
  if (delta === null) return "text-muted";
  return delta >= 0 ? "text-accent-green" : "text-accent-pink";
}
