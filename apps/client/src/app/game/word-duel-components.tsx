import type { GameState, PlayerId, Tile } from "./word-game";
import { VISIBLE_WORD_SLOTS } from "./word-duel-constants";

type PlayerColumnProps = {
  align: "left" | "right";
  isActive: boolean;
  playerId: PlayerId;
  state: GameState;
};

type RackPanelProps = {
  onRefresh: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
  onTileClick: (tile: Tile) => void;
  player: { name: string; rack: Tile[] };
  selectedTileIds: Set<string>;
  status: GameState["status"];
};

export function WordSlots({ tiles }: { tiles: Tile[] }): React.ReactElement {
  const wordTiles = Array.from(
    { length: VISIBLE_WORD_SLOTS },
    (_, index) => tiles[index],
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-9 gap-2 sm:gap-3">
        {wordTiles.map((tile, index) => {
          const bonusLabel = index >= 7 ? "+10" : index >= 4 ? "+5" : "";

          return (
            <div className="flex flex-col" key={tile?.id ?? `empty-${index}`}>
              <div
                className={`flex aspect-square min-h-12 items-center justify-center border-2 font-display text-2xl font-bold sm:min-h-16 sm:text-4xl ${
                  tile
                    ? "tile-shadow-teal border-accent-teal bg-accent-teal/10 text-accent-teal"
                    : bonusLabel
                      ? "border-accent-yellow/70 bg-accent-yellow/10 text-accent-yellow/80"
                      : "border-border bg-surface-strong text-muted/30"
                }`}
              >
                {tile ? (
                  <>
                    <span>{tile.letter}</span>
                    <span className="ml-1 self-end pb-2 text-[10px] sm:text-xs">
                      {tile.value}
                    </span>
                  </>
                ) : (
                  bonusLabel
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayerColumn({
  align,
  isActive,
  playerId,
  state,
}: PlayerColumnProps): React.ReactElement {
  const player = state.players[playerId];
  const playerWords = state.playedWords.filter(
    (playedWord) => playedWord.playerId === playerId,
  );

  return (
    <aside className="flex flex-col gap-3">
      <PlayerCard
        align={align}
        isActive={isActive}
        playerId={playerId}
        state={state}
      />
      <WordHistory
        align={align}
        playerName={player.name}
        playedWords={playerWords}
      />
    </aside>
  );
}

export function RackPanel({
  onRefresh,
  onShuffle,
  onSubmit,
  onTileClick,
  player,
  selectedTileIds,
  status,
}: RackPanelProps): React.ReactElement {
  const visibleRack = player.rack.filter((tile) => !selectedTileIds.has(tile.id));

  return (
    <section className="p-0">
      <p className="text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {player.name}
      </p>
      <div className="mx-auto mt-3 grid max-w-[39rem] grid-cols-6 gap-2 sm:gap-3">
        <div className="col-span-5 grid grid-cols-5 gap-2 sm:gap-3">
          {visibleRack.map((tile) => (
            <TileButton
              disabled={status === "finished"}
              key={tile.id}
              onClick={() => onTileClick(tile)}
              tile={tile}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 content-start gap-2 sm:gap-3">
          <CommandTile
            disabled={status === "finished"}
            label="Refresh"
            onClick={onRefresh}
            tone="yellow"
          />
          <CommandTile
            disabled={status === "finished"}
            label="Shuffle"
            onClick={onShuffle}
            tone="green"
          />
          <CommandTile
            disabled={status === "finished"}
            label="Submit"
            onClick={onSubmit}
            tone="pink"
          />
        </div>
      </div>
    </section>
  );
}

export function ScoreChip({
  label,
  value,
}: {
  label: string;
  value: number | string;
}): React.ReactElement {
  return (
    <p className="border-2 border-border bg-surface px-2 py-2">
      <span className="block font-display font-bold text-accent-teal">
        {value}
      </span>
      <span className="font-bold uppercase tracking-[0.12em]">{label}</span>
    </p>
  );
}

function PlayerCard({
  align,
  isActive,
  playerId,
  state,
}: PlayerColumnProps): React.ReactElement {
  const player = state.players[playerId];

  return (
    <section
      className={`border-2 p-4 ${
        isActive
          ? "border-accent-teal bg-accent-teal/10"
          : "border-border bg-surface-strong"
      } ${align === "right" ? "lg:text-right" : ""}`}
    >
      <div
        className={`flex items-end justify-between gap-4 ${
          align === "right" ? "lg:flex-row-reverse" : ""
        }`}
      >
        <h2 className="font-display text-xl font-bold uppercase italic text-foreground sm:text-2xl">
          {player.name}
        </h2>
        <p
          className={`font-display text-4xl font-bold ${
            playerId === "player-one" ? "text-accent-pink" : "text-accent-teal"
          }`}
        >
          {player.score}
        </p>
      </div>
    </section>
  );
}

function WordHistory({
  align,
  playerName,
  playedWords,
}: {
  align: "left" | "right";
  playerName: string;
  playedWords: GameState["playedWords"];
}): React.ReactElement {
  return (
    <section
      className={`border-2 border-border bg-surface-strong/70 p-3 ${
        align === "right" ? "lg:text-right" : ""
      }`}
    >
      <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-muted">
        Words
      </p>
      <div className="mt-3 grid gap-2">
        {playedWords.length ? (
          playedWords.slice(0, 8).map((play) => (
            <div
              className={`flex items-center justify-between gap-3 border-2 border-border bg-background px-3 py-2 ${
                align === "right" ? "lg:flex-row-reverse" : ""
              }`}
              key={play.id}
            >
              <span className="font-display text-sm font-bold uppercase text-foreground">
                {play.word}
              </span>
              <span className="font-display text-sm font-bold text-accent-teal">
                +{play.totalScore}
              </span>
            </div>
          ))
        ) : (
          <p className="border-2 border-border bg-background px-3 py-3 text-xs font-semibold text-muted">
            {playerName} has no words yet.
          </p>
        )}
      </div>
    </section>
  );
}

function TileButton({
  disabled,
  onClick,
  tile,
}: {
  disabled: boolean;
  onClick: () => void;
  tile: Tile;
}): React.ReactElement {
  return (
    <button
      className="tile-shadow-teal font-display flex aspect-square min-h-11 items-center justify-center border-2 border-accent-teal bg-accent-teal/10 text-2xl font-bold text-accent-teal transition disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-16 sm:text-4xl"
      disabled={disabled}
      onClick={onClick}
      title={`${tile.letter}, worth ${tile.value}`}
      type="button"
    >
      <span>{tile.letter}</span>
      <span className="ml-1 self-end pb-2 text-[10px] sm:text-xs">
        {tile.value}
      </span>
    </button>
  );
}

function CommandTile({
  disabled,
  label,
  onClick,
  tone,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  tone: "pink" | "yellow" | "green";
}): React.ReactElement {
  const toneClassNames: Record<typeof tone, string> = {
    pink:
      "border-accent-pink bg-accent-pink/20 text-accent-pink shadow-[6px_6px_0_var(--shadow-pink)]",
    yellow:
      "border-accent-yellow bg-accent-yellow/20 text-accent-yellow shadow-[6px_6px_0_#7b6a00]",
    green:
      "border-accent-green bg-accent-green/20 text-accent-green shadow-[6px_6px_0_#1f7a30]",
  };

  return (
    <button
      className={`font-display flex aspect-square min-h-11 items-center justify-center border-2 px-1 text-center text-[9px] font-bold uppercase leading-tight tracking-[0.06em] transition disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-16 sm:text-[10px] ${toneClassNames[tone]}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
