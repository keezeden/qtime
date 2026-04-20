"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  PlayerColumn,
  RackPanel,
  ScoreChip,
  WordSlots,
} from "./word-duel-components";
import { VISIBLE_WORD_SLOTS } from "./word-duel-constants";
import { RulesModal } from "./word-duel-rules-modal";
import {
  DEFAULT_TARGET_SCORE,
  type GameState,
  type MatchEvent,
  type Tile,
  createGame,
  refreshRack,
  scoreWord,
  submitWord,
} from "./word-game";
import { shuffleTiles } from "./word-game-tiles";

export function WordDuel(): React.ReactElement {
  const [targetScore, setTargetScore] = useState(DEFAULT_TARGET_SCORE);
  const [game, setGame] = useState<GameState>(() =>
    createGame(DEFAULT_TARGET_SCORE),
  );
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
    (letter: string): void => {
      if (game.status === "finished") {
        return;
      }

      const normalizedLetter = letter.toUpperCase();

      setSelectedTiles((currentTiles) => {
        if (currentTiles.length >= VISIBLE_WORD_SLOTS) {
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
    (tile: Tile): void => {
      if (game.status === "finished") {
        return;
      }

      setSelectedTiles((currentTiles) => {
        if (
          currentTiles.length >= VISIBLE_WORD_SLOTS ||
          currentTiles.some((selectedTile) => selectedTile.id === tile.id)
        ) {
          return currentTiles;
        }

        return [...currentTiles, tile];
      });
    },
    [game.status],
  );

  const removeLastTile = useCallback((): void => {
    setSelectedTiles((currentTiles) => currentTiles.slice(0, -1));
  }, []);

  const clearSelectedTiles = useCallback((): void => {
    setSelectedTiles([]);
  }, []);

  const commitWord = useCallback((): void => {
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

    function handleKeyDown(event: KeyboardEvent): void {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    commitWord();
  }

  function handleRefreshRack(): void {
    const playerName = currentPlayer.name;
    const nextGame = refreshRack(game);
    setGame(nextGame);
    clearSelectedTiles();
    setMessage(`${playerName} refreshed their rack and passed the turn.`);
  }

  function handleShuffleRack(): void {
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

  function handleNewMatch(nextTargetScore: number): void {
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
            onClick={() => handleNewMatch(targetScore)}
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

function logMatchEvent(event: MatchEvent): void {
  // Future API or realtime transport can send the same event payload from here.
  console.log("[QTime local match event]", event);
}
