"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_TARGET_SCORE,
  GameState,
  MatchEvent,
  PlayerId,
  Tile,
  createGame,
  refreshRack,
  scoreWord,
  submitWord,
} from "./word-game";

const scoreTargetOptions = [100, 250, DEFAULT_TARGET_SCORE, 750];
const visibleWordSlots = 9;
const rules = [
  "One word per turn.",
  "Use only letters from your own rack.",
  "Draw back to fifteen tiles after scoring.",
  "Refresh your rack to pass when stuck.",
  "First player to the target score wins.",
];

export function WordDuel() {
  const [targetScore, setTargetScore] = useState(DEFAULT_TARGET_SCORE);
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loggedEventCount = useRef(0);

  const currentPlayer = game.players[game.currentPlayerId];
  const selectedTileIds = useMemo(
    () => new Set(selectedTiles.map((tile) => tile.id)),
    [selectedTiles],
  );
  const wordEntry = useMemo(
    () => selectedTiles.map((tile) => tile.letter).join(""),
    [selectedTiles],
  );
  const previewScore = useMemo(() => scoreWord(wordEntry), [wordEntry]);

  useEffect(() => {
    const newEvents = game.eventLog.slice(loggedEventCount.current);
    newEvents.forEach(logMatchEvent);
    loggedEventCount.current = game.eventLog.length;
  }, [game.eventLog]);

  const addLetterToWord = useCallback(
    (letter: string) => {
      if (game.status === "finished") {
        return;
      }

      const normalizedLetter = letter.toUpperCase();

      setSelectedTiles((currentTiles) => {
        if (currentTiles.length >= visibleWordSlots) {
          return currentTiles;
        }

        const currentIds = new Set(currentTiles.map((tile) => tile.id));
        const nextTile = currentPlayer.rack.find(
          (tile) =>
            tile.letter === normalizedLetter && !currentIds.has(tile.id),
        );

        if (!nextTile) {
          setMessage(`${currentPlayer.name} has no ${normalizedLetter} tile left.`);
          return currentTiles;
        }

        return [...currentTiles, nextTile];
      });
    },
    [currentPlayer.name, currentPlayer.rack, game.status],
  );

  const addTileToWord = useCallback(
    (tile: Tile) => {
      if (game.status === "finished") {
        return;
      }

      setSelectedTiles((currentTiles) => {
        if (
          currentTiles.length >= visibleWordSlots ||
          currentTiles.some((selectedTile) => selectedTile.id === tile.id)
        ) {
          return currentTiles;
        }

        return [...currentTiles, tile];
      });
    },
    [game.status],
  );

  const removeLastTile = useCallback(() => {
    setSelectedTiles((currentTiles) => currentTiles.slice(0, -1));
  }, []);

  const clearSelectedTiles = useCallback(() => {
    setSelectedTiles([]);
  }, []);

  const commitWord = useCallback(() => {
    const result = submitWord(game, wordEntry);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    const playedWord = result.state.playedWords[0];
    setGame(result.state);
    clearSelectedTiles();
    setMessage(
      result.state.status === "finished"
        ? `${playedWord.playerName} wins with ${playedWord.word}.`
        : "",
    );
  }, [clearSelectedTiles, game, wordEntry]);

  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLastTile();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        commitWord();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        addLetterToWord(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addLetterToWord, commitWord, isModalOpen, removeLastTile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitWord();
  }

  function handleRefreshRack() {
    const playerName = currentPlayer.name;
    const nextGame = refreshRack(game);
    setGame(nextGame);
    clearSelectedTiles();
    setMessage(`${playerName} refreshed their rack and passed the turn.`);
  }

  function handleShuffleRack() {
    setGame((currentGame) => ({
      ...currentGame,
      players: {
        ...currentGame.players,
        [currentGame.currentPlayerId]: {
          ...currentGame.players[currentGame.currentPlayerId],
          rack: shuffleTiles(currentGame.players[currentGame.currentPlayerId].rack),
        },
      },
    }));
    clearSelectedTiles();
  }

  function handleNewMatch(nextTargetScore = targetScore) {
    setTargetScore(nextTargetScore);
    setGame(createGame(nextTargetScore));
    clearSelectedTiles();
    setMessage("");
    loggedEventCount.current = 0;
  }

  return (
    <main className="flex min-h-screen flex-col overflow-hidden px-4 py-5 sm:px-6">
      <header className="flex w-full items-center justify-between gap-4">
        <Link
          className="font-display text-lg font-bold italic uppercase text-accent-pink sm:text-xl"
          href="/"
        >
          QTime
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="font-display min-h-11 border-2 border-border bg-surface-strong px-4 text-xs font-bold uppercase tracking-[0.14em] text-foreground"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            Rules
          </button>
          <button
            className="pressable-teal font-display min-h-11 border-2 border-black bg-accent-teal px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#081312]"
            onClick={() => handleNewMatch()}
            type="button"
          >
            New Match
          </button>
        </div>
      </header>

      <section className="grid w-full flex-1 grid-rows-[auto_1fr_auto] gap-5 py-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(150px,12vw)_1fr_minmax(150px,12vw)] lg:items-start">
          <PlayerColumn
            align="left"
            isActive={game.currentPlayerId === "player-one"}
            playerId="player-one"
            state={game}
          />

          <form
            className="order-first flex flex-col items-center text-center lg:order-none"
            onSubmit={handleSubmit}
          >
            <WordSlots tiles={selectedTiles} />

            <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-2 text-xs text-muted">
              <ScoreChip label="Base" value={previewScore.baseScore} />
              <ScoreChip label="Bonus" value={`+${previewScore.bonusScore}`} />
              <ScoreChip label="Turn" value={previewScore.totalScore} />
            </div>

            <button className="sr-only" type="submit">
              Submit
            </button>
          </form>

          <PlayerColumn
            align="right"
            isActive={game.currentPlayerId === "player-two"}
            playerId="player-two"
            state={game}
          />
        </div>

        <section className="flex min-h-16 items-center justify-center">
          {message ? (
            <div className="w-full max-w-4xl border-2 border-accent-pink/60 bg-accent-pink/10 px-4 py-3 text-center text-sm font-semibold text-foreground sm:text-base">
              {message}
            </div>
          ) : null}
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4">
          <RackPanel
            onRefresh={handleRefreshRack}
            onShuffle={handleShuffleRack}
            onSubmit={commitWord}
            onTileClick={addTileToWord}
            selectedTileIds={selectedTileIds}
            player={currentPlayer}
            status={game.status}
          />
        </section>
      </section>

      {isModalOpen ? (
        <RulesModal
          game={game}
          onClose={() => setIsModalOpen(false)}
          onNewMatch={handleNewMatch}
          targetScore={targetScore}
        />
      ) : null}
    </main>
  );
}

function WordSlots({ tiles }: { tiles: Tile[] }) {
  const wordTiles = Array.from(
    { length: visibleWordSlots },
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

function PlayerColumn({
  align,
  isActive,
  playerId,
  state,
}: {
  align: "left" | "right";
  isActive: boolean;
  playerId: PlayerId;
  state: GameState;
}) {
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

function PlayerCard({
  align,
  isActive,
  playerId,
  state,
}: {
  align: "left" | "right";
  isActive: boolean;
  playerId: PlayerId;
  state: GameState;
}) {
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
}) {
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

function RackPanel({
  onRefresh,
  onShuffle,
  onSubmit,
  onTileClick,
  player,
  selectedTileIds,
  status,
}: {
  onRefresh: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
  onTileClick: (tile: Tile) => void;
  player: { name: string; rack: Tile[] };
  selectedTileIds: Set<string>;
  status: GameState["status"];
}) {
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

function TileButton({
  disabled,
  onClick,
  tile,
}: {
  disabled: boolean;
  onClick: () => void;
  tile: Tile;
}) {
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

function ScoreChip({ label, value }: { label: string; value: number | string }) {
  return (
    <p className="border-2 border-border bg-surface px-2 py-2">
      <span className="block font-display font-bold text-accent-teal">
        {value}
      </span>
      <span className="font-bold uppercase tracking-[0.12em]">{label}</span>
    </p>
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
}) {
  const toneClassNames = {
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

function shuffleTiles(tiles: Tile[]) {
  const shuffled = [...tiles];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function RulesModal({
  game,
  onClose,
  onNewMatch,
  targetScore,
}: {
  game: GameState;
  onClose: () => void;
  onNewMatch: (targetScore?: number) => void;
  targetScore: number;
}) {
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
          {rules.map((rule, index) => (
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

        <div className="mt-6 border-2 border-border bg-surface p-4">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-teal">
            Target Score
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scoreTargetOptions.map((option) => (
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

function logMatchEvent(event: MatchEvent) {
  // Future API or realtime transport can send the same event payload from here.
  console.log("[QTime local match event]", event);
}
