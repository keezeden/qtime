import { useEffect, useState } from "react";
import { fetchMatchHistory, type MatchHistoryItem } from "./multiplayer-api";
import type { GameState } from "@qtime/game";

type FinishGameModalProps = {
  game: GameState;
  matchId: number;
  onDismiss: () => void;
  onQueueAgain: () => void;
};

export function FinishGameModal({
  game,
  matchId,
  onDismiss,
  onQueueAgain,
}: FinishGameModalProps): React.ReactElement {
  const [history, setHistory] = useState<MatchHistoryItem | null>(null);
  const winner = game.winnerId ? game.players[game.winnerId] : null;
  const ratingDelta = history?.ratingDelta ?? null;

  useEffect(() => {
    async function loadHistory(): Promise<void> {
      const response = await fetchMatchHistory();
      setHistory(response.matches.find((item) => item.id === matchId) ?? null);
    }

    void loadHistory();
  }, [matchId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="panel-shadow w-full max-w-xl border-2 border-border bg-surface-strong p-6 text-center sm:p-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-yellow">
          Match Complete
        </p>
        <h2 className="font-display mt-3 text-4xl font-bold uppercase italic text-foreground sm:text-5xl">
          {winner ? `${winner.name} wins` : "Game Over"}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {Object.values(game.players).map((player) => (
            <div className="border-2 border-border bg-background p-4" key={player.id}>
              <p className="font-display text-sm font-bold uppercase text-muted">{player.name}</p>
              <p className="font-display mt-2 text-4xl font-bold text-accent-teal">{player.score}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-2 border-border bg-surface p-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Rating Change
          </p>
          <p className={`font-display mt-2 text-4xl font-bold ${getDeltaTone(ratingDelta)}`}>
            {formatDelta(ratingDelta)}
          </p>
          {history && history.oldRating !== null && history.newRating !== null ? (
            <p className="mt-2 text-sm font-semibold text-muted">
              {history.oldRating} to {history.newRating}
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-muted">Rating update pending.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="pressable-teal font-display min-h-12 border-2 border-black bg-accent-teal px-5 text-sm font-bold uppercase text-[#081312]"
            onClick={onQueueAgain}
            type="button"
          >
            Queue Again
          </button>
          <button
            className="font-display min-h-12 border-2 border-border bg-surface px-5 text-sm font-bold uppercase text-foreground"
            onClick={onDismiss}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </section>
    </div>
  );
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "--";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function getDeltaTone(delta: number | null): string {
  if (delta === null) return "text-muted";
  return delta >= 0 ? "text-accent-green" : "text-accent-pink";
}
