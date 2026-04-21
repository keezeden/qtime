import Link from "next/link";

type QueueStatus = "idle" | "queued" | "matched";

type QueuePanelProps = {
  message: string;
  onCancel: () => void;
  onQueue: () => void;
  status: QueueStatus;
};

export function GameHeader(): React.ReactElement {
  return (
    <header className="flex w-full items-center justify-between gap-4">
      <Link
        className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl"
        href="/"
      >
        QTime
      </Link>
      <Link
        className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent-teal"
        href="/dashboard"
      >
        Dashboard
      </Link>
    </header>
  );
}

export function QueuePanel({
  message,
  onCancel,
  onQueue,
  status,
}: QueuePanelProps): React.ReactElement {
  return (
    <section className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center text-center">
      <div className="border-2 border-border bg-surface-strong px-6 py-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-yellow">
          Word Duel
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold uppercase italic text-foreground sm:text-6xl">
          Find Match
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
          {message ||
            "Queue for an OCE word-duel match. The game starts when the worker pairs two players."}
        </p>
        <SearchingAnimation active={status === "queued"} />
        <button
          className="pressable-teal font-display mt-6 min-h-12 border-2 border-black bg-accent-teal px-6 text-sm font-bold uppercase text-[#081312]"
          disabled={status === "queued"}
          onClick={onQueue}
          type="button"
        >
          {status === "queued" ? "Searching" : "Queue Multiplayer"}
        </button>
        {status === "queued" ? (
          <button
            className="font-display mt-3 min-h-10 border-2 border-border bg-surface px-4 text-xs font-bold uppercase tracking-[0.14em] text-muted"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function StatusMessage({ message }: { message: string }): React.ReactElement {
  return (
    <div className="w-full max-w-4xl border-2 border-accent-pink/60 bg-accent-pink/10 px-4 py-3 text-center text-sm font-semibold text-foreground sm:text-base">
      {message}
    </div>
  );
}

function SearchingAnimation({ active }: { active: boolean }): React.ReactElement {
  const dots = ["0ms", "160ms", "320ms", "480ms"];

  return (
    <div
      aria-label={active ? "Searching for opponent" : "Ready to search"}
      className="mx-auto mt-7 flex h-14 items-center justify-center gap-3"
    >
      {dots.map((delay, index) => (
        <span
          className={`block h-4 w-4 border-2 border-accent-teal bg-accent-teal ${
            active ? "animate-bounce" : "opacity-35"
          }`}
          key={delay}
          style={{ animationDelay: delay }}
        >
          <span className="sr-only">Search pulse {index + 1}</span>
        </span>
      ))}
    </div>
  );
}
