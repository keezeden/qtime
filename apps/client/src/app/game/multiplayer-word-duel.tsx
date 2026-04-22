"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/app/lib/auth";
import { FinishGameModal } from "./finish-game-modal";
import { MultiplayerGameBoard } from "./multiplayer-game-board";
import { GameHeader, QueuePanel } from "./multiplayer-queue-panel";
import { fetchGameEvents, fetchMatchState, isGameState, readEventState, submitGameState, type GameEventType, type MatchSummary } from "./multiplayer-api";
import type { GameState } from "@qtime/game";
import { refreshRack, submitWord } from "@qtime/game";
import { shuffleTiles } from "@qtime/game";
import { createFinishedMessage, createNamedGame, createWordEventSubmission, getLocalPlayerId } from "./multiplayer-state";
import { MultiplayerRulesButton } from "./multiplayer-rules-button";
import { useGameSocket } from "./use-game-socket";
import { useMatchmakingQueue } from "./use-matchmaking-queue";
import { useWordKeyboard } from "./use-word-keyboard";
import { useWordSelection } from "./use-word-selection";

type Props = { user: AuthUser };

export function MultiplayerWordDuel({ user }: Props): React.ReactElement {
  const [game, setGame] = useState<GameState | null>(null);
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("");
  const [dismissedFinishMatchId, setDismissedFinishMatchId] = useState<number | null>(null);
  const [gameSocketUrl, setGameSocketUrl] = useState<string | null>(null);
  const { cancelQueue, match, queueStatus, startMatchmaking } = useMatchmakingQueue({
    onMatchFound: loadMatchState,
    onQueueStarted: resetForQueue,
  });
  const localPlayerId = useMemo(() => getLocalPlayerId(match, user.id), [match, user.id]);
  const currentPlayer = game ? game.players[game.currentPlayerId] : null;
  const rackPlayer = game && localPlayerId ? game.players[localPlayerId] : currentPlayer;
  const isLocalTurn = Boolean(game && localPlayerId === game.currentPlayerId);
  const selection = useWordSelection({
    enabled: Boolean(rackPlayer && isLocalTurn),
    rack: rackPlayer?.rack ?? [],
    playerName: rackPlayer?.name ?? "Player",
    onMessage: setMessage,
  });
  const {
    addLetter,
    addTile,
    clear: clearSelectedTiles,
    previewScore,
    removeLast,
    selectedTileIds,
    selectedTiles,
    wordEntry,
  } = selection;

  const applySocketSnapshot = useCallback((nextGame: GameState, nextVersion: number): void => {
    setGame(nextGame);
    setVersion(nextVersion);
    clearSelectedTiles();
    setMessage(createFinishedMessage(nextGame));
  }, [clearSelectedTiles]);

  const handleSocketError = useCallback((): void => {
    setMessage("Connection to the game server was interrupted.");
  }, []);

  const pollEvents = useCallback(async (matchId: number): Promise<void> => {
    const events = await fetchGameEvents(matchId, version);
    const latestEvent = events.at(-1);
    const latestState = latestEvent ? readEventState(latestEvent) : null;
    if (latestEvent && latestState) {
      setGame(latestState);
      setVersion(latestEvent.version);
      clearSelectedTiles();
      setMessage(createFinishedMessage(latestState));
    }
  }, [clearSelectedTiles, version]);

  useEffect(() => {
    void startMatchmaking(false);
    return () => void cancelQueue();
  }, []);

  useEffect(() => {
    if (!match) return;

    const interval = window.setInterval(() => void pollEvents(match.id), 1200);
    return () => window.clearInterval(interval);
  }, [match, pollEvents]);

  useGameSocket({
    matchId: match?.id ?? null,
    websocketUrl: gameSocketUrl,
    onSnapshot: applySocketSnapshot,
    onConnectionError: handleSocketError,
  });

  useWordKeyboard({
    enabled: Boolean(game && rackPlayer && isLocalTurn),
    onBackspace: removeLast,
    onCommit: () => void commitWord(),
    onLetter: addLetter,
  });

  function resetForQueue(): void {
    setGame(null);
    setGameSocketUrl(null);
    setVersion(0);
    setDismissedFinishMatchId(null);
    setMessage("Searching for an opponent in OCE.");
  }

  async function loadMatchState(currentMatch: MatchSummary): Promise<void> {
    const envelope = await fetchMatchState(currentMatch.id);
    setVersion(envelope.version);
    setGameSocketUrl(envelope.gameConnection?.websocketUrl ?? null);

    if (isGameState(envelope.state)) {
      setGame(envelope.state);
      return;
    }

    if (envelope.gameConnection) {
      setMessage("Connecting to the game server.");
      return;
    }

    if (getLocalPlayerId(currentMatch, user.id) === "player-one" && envelope.version === 0) {
      await publishState(currentMatch.id, 0, "game_initialized", {}, createNamedGame(currentMatch));
    } else {
      setMessage("Waiting for opponent to initialize the game.");
    }
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

  return (
    <main className="flex min-h-screen flex-col overflow-hidden px-4 py-5 sm:px-6">
      <GameHeader />
      {!match || !game || !currentPlayer || !rackPlayer ? (
        <QueuePanel message={message} onCancel={() => { setMessage(""); void cancelQueue(); }} onQueue={() => void startMatchmaking(false)} status={queueStatus} />
      ) : (
        <MultiplayerGameBoard
          game={game}
          isLocalTurn={isLocalTurn}
          message={message}
          onRefreshRack={() => void handleRefreshRack()}
          onShuffleRack={() => void handleShuffleRack()}
          onSubmit={() => void commitWord()}
          onTileClick={addTile}
          previewScore={previewScore}
          rackPlayer={rackPlayer}
          selectedTileIds={selectedTileIds}
          selectedTiles={selectedTiles}
          version={version}
        />
      )}
      {game ? <MultiplayerRulesButton game={game} /> : null}
      {game && match && game.status === "finished" && dismissedFinishMatchId !== match.id ? (
        <FinishGameModal game={game} matchId={match.id} onDismiss={() => setDismissedFinishMatchId(match.id)} onQueueAgain={() => void startMatchmaking(true)} />
      ) : null}
    </main>
  );
}
