"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { AuthUser } from "@/app/lib/auth";
import { PlayerColumn, RackPanel, ScoreChip, WordSlots } from "./word-duel-components";
import { VISIBLE_WORD_SLOTS } from "./word-duel-constants";
import { GameHeader, QueuePanel, StatusMessage } from "./multiplayer-queue-panel";
import {
  fetchCurrentMatch,
  fetchGameEvents,
  fetchMatchState,
  isGameState,
  joinMatchmaking,
  readEventState,
  submitGameState,
  type GameEventType,
  type MatchSummary,
} from "./multiplayer-api";
import type { GameState, Tile } from "./word-game";
import { refreshRack, scoreWord, submitWord } from "./word-game";
import { shuffleTiles } from "./word-game-tiles";
import { createNamedGame, createWordEventSubmission, getLocalPlayerId } from "./multiplayer-state";

type Props = {
  user: AuthUser;
};

type QueueStatus = "idle" | "queued" | "matched";

export function MultiplayerWordDuel({ user }: Props): React.ReactElement {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("idle");
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [version, setVersion] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [message, setMessage] = useState("");
  const localPlayerId = useMemo(() => getLocalPlayerId(match, user.id), [match, user.id]);
  const currentPlayer = game ? game.players[game.currentPlayerId] : null;
  const rackPlayer = game && localPlayerId ? game.players[localPlayerId] : currentPlayer;
  const isLocalTurn = Boolean(game && localPlayerId === game.currentPlayerId);
  const selectedTileIds = useMemo(() => new Set(selectedTiles.map((tile) => tile.id)), [selectedTiles]);
  const wordEntry = useMemo(() => selectedTiles.map((tile) => tile.letter).join(""), [selectedTiles]);
  const previewScore = useMemo(() => scoreWord(wordEntry), [wordEntry]);

  useEffect(() => {
    void startMatchmaking();
  }, []);

  useEffect(() => {
    if (queueStatus !== "queued") return;

    const interval = window.setInterval(() => void refreshCurrentMatch(), 2000);
    return () => window.clearInterval(interval);
  }, [queueStatus]);

  useEffect(() => {
    if (!match) return;

    const interval = window.setInterval(() => void pollEvents(match.id), 1200);
    return () => window.clearInterval(interval);
  }, [match, version]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!game || !rackPlayer || !isLocalTurn) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLastTile();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void commitWord();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        addLetterToWord(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, isLocalTurn, rackPlayer, selectedTiles]);

  const clearSelectedTiles = useCallback((): void => {
    setSelectedTiles([]);
  }, []);

  async function refreshCurrentMatch(): Promise<void> {
    const currentMatch = await fetchCurrentMatch();

    if (!currentMatch) return;

    setMatch(currentMatch);
    setQueueStatus("matched");
    await loadMatchState(currentMatch);
  }

  async function loadMatchState(currentMatch: MatchSummary): Promise<void> {
    const envelope = await fetchMatchState(currentMatch.id);
    setVersion(envelope.version);

    if (isGameState(envelope.state)) {
      setGame(envelope.state);
      return;
    }

    if (getLocalPlayerId(currentMatch, user.id) === "player-one" && envelope.version === 0) {
      await publishState(currentMatch.id, 0, "game_initialized", {}, createNamedGame(currentMatch));
    } else {
      setMessage("Waiting for opponent to initialize the game.");
    }
  }

  async function pollEvents(matchId: number): Promise<void> {
    const events = await fetchGameEvents(matchId, version);
    const latestEvent = events.at(-1);
    const latestState = latestEvent ? readEventState(latestEvent) : null;

    if (latestEvent && latestState) {
      setGame(latestState);
      setVersion(latestEvent.version);
      clearSelectedTiles();
      setMessage("");
    }
  }

  async function handleQueue(): Promise<void> {
    await startMatchmaking();
  }

  async function startMatchmaking(): Promise<void> {
    if (queueStatus === "queued" || queueStatus === "matched") return;

    setQueueStatus("queued");
    setMessage("Searching for an opponent in OCE.");
    const currentMatch = await fetchCurrentMatch();

    if (currentMatch) {
      setMatch(currentMatch);
      setQueueStatus("matched");
      await loadMatchState(currentMatch);
      return;
    }

    await joinMatchmaking();
    await refreshCurrentMatch();
  }

  async function publishState(
    matchId: number,
    baseVersion: number,
    type: GameEventType,
    payload: Record<string, unknown>,
    nextState: GameState,
  ): Promise<void> {
    const envelope = await submitGameState(matchId, baseVersion, type, payload, nextState);
    setVersion(envelope.version);

    if (isGameState(envelope.state)) {
      setGame(envelope.state);
    }
  }

  async function commitWord(): Promise<void> {
    if (!game || !match || !isLocalTurn) return;

    const result = submitWord(game, wordEntry);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    const event = createWordEventSubmission(match, result.state);

    await publishState(match.id, version, event.type, event.payload, result.state);
    clearSelectedTiles();
  }

  async function handleRefreshRack(): Promise<void> {
    if (!game || !match || !isLocalTurn) return;

    await publishState(match.id, version, "rack_refreshed", {}, refreshRack(game));
    clearSelectedTiles();
  }

  async function handleShuffleRack(): Promise<void> {
    if (!game || !match || !isLocalTurn) return;

    const nextGame = {
      ...game,
      players: {
        ...game.players,
        [game.currentPlayerId]: {
          ...game.players[game.currentPlayerId],
          rack: shuffleTiles(game.players[game.currentPlayerId].rack),
        },
      },
    };
    await publishState(match.id, version, "rack_shuffled", {}, nextGame);
    clearSelectedTiles();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void commitWord();
  }

  function addTileToWord(tile: Tile): void {
    if (!isLocalTurn) return;

    setSelectedTiles((currentTiles) => {
      if (currentTiles.length >= VISIBLE_WORD_SLOTS || currentTiles.some((selectedTile) => selectedTile.id === tile.id)) {
        return currentTiles;
      }

      return [...currentTiles, tile];
    });
  }

  function addLetterToWord(letter: string): void {
    if (!rackPlayer || !isLocalTurn) return;

    const normalizedLetter = letter.toUpperCase();

    setSelectedTiles((currentTiles) => {
      if (currentTiles.length >= VISIBLE_WORD_SLOTS) {
        return currentTiles;
      }

      const currentIds = new Set(currentTiles.map((tile) => tile.id));
      const nextTile = rackPlayer.rack.find(
        (tile) => tile.letter === normalizedLetter && !currentIds.has(tile.id),
      );

      if (!nextTile) {
        setMessage(`${rackPlayer.name} has no ${normalizedLetter} tile left.`);
        return currentTiles;
      }

      return [...currentTiles, nextTile];
    });
  }

  function removeLastTile(): void {
    setSelectedTiles((currentTiles) => currentTiles.slice(0, -1));
  }

  return (
    <main className="flex min-h-screen flex-col overflow-hidden px-4 py-5 sm:px-6">
      <GameHeader />
      {!match || !game || !currentPlayer || !rackPlayer ? (
        <QueuePanel message={message} onQueue={() => void handleQueue()} status={queueStatus} />
      ) : (
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
              onRefresh={() => void handleRefreshRack()}
              onShuffle={() => void handleShuffleRack()}
              onSubmit={() => void commitWord()}
              onTileClick={addTileToWord}
              selectedTileIds={selectedTileIds}
              player={rackPlayer}
              status={isLocalTurn ? game.status : "finished"}
            />
          </section>
        </section>
      )}
    </main>
  );
}
