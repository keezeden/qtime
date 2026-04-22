import type { FormEvent } from "react";
import type { GameState, Tile, WordScore } from "@qtime/game";
import { StatusMessage } from "./multiplayer-queue-panel";
import { PlayerColumn, RackPanel, ScoreChip, WordSlots } from "./word-duel-components";

type MultiplayerGameBoardProps = {
  game: GameState;
  isLocalTurn: boolean;
  message: string;
  onRefreshRack: () => void;
  onShuffleRack: () => void;
  onSubmit: () => void;
  onTileClick: (tile: Tile) => void;
  previewScore: WordScore;
  rackPlayer: { name: string; rack: Tile[] };
  selectedTileIds: Set<string>;
  selectedTiles: Tile[];
  version: number;
};

export function MultiplayerGameBoard({
  game,
  isLocalTurn,
  message,
  onRefreshRack,
  onShuffleRack,
  onSubmit,
  onTileClick,
  previewScore,
  rackPlayer,
  selectedTileIds,
  selectedTiles,
  version,
}: MultiplayerGameBoardProps): React.ReactElement {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="grid w-full flex-1 grid-rows-[auto_1fr_auto] gap-5 py-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(150px,12vw)_1fr_minmax(150px,12vw)] lg:items-start">
        <PlayerColumn align="left" isActive={game.currentPlayerId === "player-one"} playerId="player-one" state={game} />
        <form className="order-first flex flex-col items-center text-center lg:order-none" onSubmit={handleSubmit}>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {isLocalTurn ? "Your turn" : "Opponent turn"} / v{version}
          </p>
          <WordSlots tiles={selectedTiles} />
          <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-2 text-xs text-muted">
            <ScoreChip label="Base" value={previewScore.baseScore} />
            <ScoreChip label="Bonus" value={`+${previewScore.bonusScore}`} />
            <ScoreChip label="Turn" value={previewScore.totalScore} />
          </div>
          <button className="sr-only" type="submit">Submit</button>
        </form>
        <PlayerColumn align="right" isActive={game.currentPlayerId === "player-two"} playerId="player-two" state={game} />
      </div>
      <section className="flex min-h-16 items-center justify-center">
        {message ? <StatusMessage message={message} /> : null}
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-4">
        <RackPanel
          onRefresh={onRefreshRack}
          onShuffle={onShuffleRack}
          onSubmit={onSubmit}
          onTileClick={onTileClick}
          player={rackPlayer}
          selectedTileIds={selectedTileIds}
          status={isLocalTurn ? game.status : "finished"}
        />
      </section>
    </section>
  );
}
