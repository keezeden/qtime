import { useState } from "react";
import type { GameState } from "./word-game";
import { RulesModal } from "./word-duel-rules-modal";

type MultiplayerRulesButtonProps = {
  game: GameState;
};

export function MultiplayerRulesButton({
  game,
}: MultiplayerRulesButtonProps): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="font-display fixed bottom-4 right-4 z-40 min-h-11 border-2 border-border bg-surface-strong px-4 text-xs font-bold uppercase tracking-[0.14em] text-foreground"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        Rules
      </button>
      {isModalOpen ? (
        <RulesModal
          game={game}
          onClose={() => setIsModalOpen(false)}
          onNewMatch={() => undefined}
          showTargetControls={false}
          targetScore={game.targetScore}
        />
      ) : null}
    </>
  );
}
