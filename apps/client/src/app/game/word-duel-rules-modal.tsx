import { RULES, SCORE_TARGET_OPTIONS } from "./word-duel-constants";
import type { GameState } from "./word-game";

type RulesModalProps = {
  game: GameState;
  onClose: () => void;
  onNewMatch: (targetScore: number) => void;
  showTargetControls: boolean;
  targetScore: number;
};

export function RulesModal({
  game,
  onClose,
  onNewMatch,
  showTargetControls,
  targetScore,
}: RulesModalProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="panel-shadow max-h-[90vh] w-full max-w-3xl overflow-y-auto border-2 border-border bg-surface-strong p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-yellow">
              Word Duel
            </p>
            <h2 className="font-display mt-2 text-4xl font-bold uppercase italic text-foreground">
              Rules
            </h2>
          </div>
          <button
            className="font-display min-h-11 border-2 border-border bg-surface px-4 text-sm font-bold uppercase text-foreground"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {RULES.map((rule, index) => (
            <p
              className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-2 border-border bg-background px-4 py-3 text-sm text-muted"
              key={rule}
            >
              <span className="font-display text-lg font-bold text-accent-pink">
                {index + 1}
              </span>
              {rule}
            </p>
          ))}
        </div>

        {showTargetControls ? (
          <div className="mt-6 border-2 border-border bg-surface p-4">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-teal">
              Target Score
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SCORE_TARGET_OPTIONS.map((option) => (
                <button
                  className={`font-display border-2 px-3 py-3 text-sm font-bold uppercase ${
                    targetScore === option
                      ? "border-accent-yellow bg-accent-yellow text-[#151100]"
                      : "border-border bg-background text-muted"
                  }`}
                  key={option}
                  onClick={() => onNewMatch(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 border-2 border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-pink">
              Match Feed
            </p>
            <p className="text-sm font-semibold text-muted">
              Bag: {game.tileBag.length}
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {game.playedWords.length ? (
              game.playedWords.slice(0, 6).map((play) => (
                <div
                  className="border-2 border-border bg-background px-4 py-4"
                  key={play.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-xl font-bold text-foreground">
                      {play.word}
                    </p>
                    <p className="font-display text-xl font-bold text-accent-teal">
                      +{play.totalScore}
                    </p>
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    {play.playerName} / turn {play.turnNumber} / base{" "}
                    {play.baseScore} + bonus {play.bonusScore}
                  </p>
                </div>
              ))
            ) : (
              <p className="border-2 border-border bg-background px-4 py-5 text-sm text-muted">
                No words yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
