"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { AuthUser } from "@/app/lib/auth";
import { FinishGameModal } from "./finish-game-modal";
import { PlayerColumn, RackPanel, ScoreChip, WordSlots } from "./word-duel-components";
import { VISIBLE_WORD_SLOTS } from "./word-duel-constants";
import { GameHeader, QueuePanel, StatusMessage } from "./multiplayer-queue-panel";
import { fetchCurrentMatch, fetchGameEvents, fetchMatchState, isGameState, joinMatchmaking, leaveMatchmaking, readEventState, submitGameState, type GameEventType, type MatchSummary } from "./multiplayer-api";
import type { GameState, Tile } from "@qtime/game";
import { refreshRack, scoreWord, submitWord } from "@qtime/game";
import { shuffleTiles } from "@qtime/game";
import { createFinishedMessage, createNamedGame, createWordEventSubmission, getLocalPlayerId } from "./multiplayer-state";
import { MultiplayerRulesButton } from "./multiplayer-rules-button";

type Props = {
  user: AuthUser;
};

type QueueStatus = "idle" | "queued" | "matched";

export function MultiplayerWordDuel({ user }: Props): React.ReactElement {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("idle");
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [queuedAfter, setQueuedAfter] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [message, setMessage] = useState("");
  const [dismissedFinishMatchId, setDismissedFinishMatchId] = useState<number | null>(null);
  const queueJobIdRef = useRef<string | null>(null);
  const localPlayerId = useMemo(() => getLocalPlayerId(match, user.id), [match, user.id]);
  const currentPlayer = game ? game.players[game.currentPlayerId] : null;
  const rackPlayer = game && localPlayerId ? game.players[localPlayerId] : currentPlayer;
  const isLocalTurn = Boolean(game && localPlayerId === game.currentPlayerId);
  const selectedTileIds = useMemo(() => new Set(selectedTiles.map((tile) => tile.id)), [selectedTiles]);
  const wordEntry = useMemo(() => selectedTiles.map((tile) => tile.letter).join(""), [selectedTiles]);
  const previewScore = useMemo(() => scoreWord(wordEntry), [wordEntry]);

  useEffect(() => {
    void startMatchmaking(false);

    return () => void leaveCurrentQueue();
  }, []);

  useEffect(() => {
    if (queueStatus !== "queued") return;

    const interval = window.setInterval(() => void refreshCurrentMatch(queuedAfter), 2000);
    return () => window.clearInterval(interval);
  }, [queueStatus, queuedAfter]);

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

  async function refreshCurrentMatch(startedAfter: string | null): Promise<void> {
    const currentMatch = await fetchCurrentMatch(startedAfter);

    if (!currentMatch) return;

    queueJobIdRef.current = null;
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
      setMessage(createFinishedMessage(latestState));
    }
  }

  async function startMatchmaking(force: boolean): Promise<void> {
    if (!force && (queueStatus === "queued" || queueStatus === "matched")) return;

    const startedAfter = new Date().toISOString();
    setMatch(null);
    setGame(null);
    setVersion(0);
    setDismissedFinishMatchId(null);
    setQueuedAfter(startedAfter);
    setQueueStatus("queued");
    setMessage("Searching for an opponent in OCE.");

    const queue = await joinMatchmaking();
    queueJobIdRef.current = queue.jobId;
    await refreshCurrentMatch(startedAfter);
  }

  async function leaveCurrentQueue(): Promise<void> {
    const queueJobId = queueJobIdRef.current;

    if (!queueJobId) return;

    queueJobIdRef.current = null;
    await leaveMatchmaking(queueJobId);
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
    setMessage(createFinishedMessage(result.state));
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
        <QueuePanel message={message} onCancel={() => { setQueueStatus("idle"); setQueuedAfter(null); setMessage(""); void leaveCurrentQueue(); }} onQueue={() => void startMatchmaking(false)} status={queueStatus} />
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
              onRefresh={() => void handleRefreshRack()} onShuffle={() => void handleShuffleRack()} onSubmit={() => void commitWord()}
              onTileClick={addTileToWord}
              selectedTileIds={selectedTileIds} player={rackPlayer} status={isLocalTurn ? game.status : "finished"}
            />
          </section>
        </section>
      )}
      {game ? <MultiplayerRulesButton game={game} /> : null}
      {game && match && game.status === "finished" && dismissedFinishMatchId !== match.id ? (
        <FinishGameModal game={game} matchId={match.id} onDismiss={() => setDismissedFinishMatchId(match.id)} onQueueAgain={() => void startMatchmaking(true)} />
      ) : null}
    </main>
  );
}
