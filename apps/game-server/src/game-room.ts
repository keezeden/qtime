import { WebSocket } from "ws";
import { createGame, refreshRack, shuffleTiles, submitWord, type GameState, type PlayerId } from "@qtime/game";
import { z } from "zod";
import { GamePersistence, type PersistedGameEventType } from "./game-persistence";

export type GameParticipant = {
  userId: number;
  seat: number;
  username: string;
};

export type GameRoom = {
  connections: Set<WebSocket>;
  matchId: number;
  playerUserIds: Record<PlayerId, number>;
  state: GameState;
  version: number;
};

const socketMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ping") }),
  z.object({
    type: z.literal("refresh_rack"),
    baseVersion: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal("shuffle_rack"),
    baseVersion: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal("submit_word"),
    baseVersion: z.number().int().nonnegative(),
    word: z.string(),
  }),
]);

const persistence = new GamePersistence();

export function createGameRoom(
  matchId: number,
  targetScore: number,
  participants: [GameParticipant, GameParticipant],
): GameRoom {
  return {
    connections: new Set(),
    matchId,
    playerUserIds: createPlayerUserIdMap(participants),
    state: createNamedGame(targetScore, participants),
    version: 0,
  };
}

export function attachConnection(room: GameRoom, connection: WebSocket): void {
  room.connections.add(connection);
  sendSnapshot(connection, room);

  connection.on("message", (message) => {
    const input = parseSocketMessage(message.toString());
    if (!input) return;
    if (input.type === "ping") sendJson(connection, { type: "pong" });
    if (input.type === "refresh_rack") void handleRefreshRackCommand(room, connection, input.baseVersion);
    if (input.type === "shuffle_rack") void handleShuffleRackCommand(room, connection, input.baseVersion);
    if (input.type === "submit_word") void handleSubmitWordCommand(room, connection, input.baseVersion, input.word);
  });
  connection.on("close", () => {
    room.connections.delete(connection);
  });
}

export async function closeGameRoomPersistence(): Promise<void> {
  await persistence.close();
}

async function handleSubmitWordCommand(
  room: GameRoom,
  connection: WebSocket,
  baseVersion: number,
  word: string,
): Promise<void> {
  if (!canApplyCommand(room, connection, baseVersion)) return;

  const playerId = room.state.currentPlayerId;
  const result = submitWord(room.state, word);
  if (result.error) {
    rejectCommand(connection, result.error, room);
    return;
  }

  await acceptState(room, connection, result.state, createSubmitWordEvent(room, playerId, word, result.state));
}

async function handleShuffleRackCommand(
  room: GameRoom,
  connection: WebSocket,
  baseVersion: number,
): Promise<void> {
  if (!canApplyCommand(room, connection, baseVersion)) return;

  const playerId = room.state.currentPlayerId;
  await acceptState(room, connection, shuffleCurrentRack(room.state), {
    playerId,
    type: "rack_shuffled",
    payload: { playerId },
  });
}

async function handleRefreshRackCommand(
  room: GameRoom,
  connection: WebSocket,
  baseVersion: number,
): Promise<void> {
  if (!canApplyCommand(room, connection, baseVersion)) return;

  const playerId = room.state.currentPlayerId;
  await acceptState(room, connection, refreshRack(room.state), {
    playerId,
    type: "rack_refreshed",
    payload: { playerId },
  });
}

async function acceptState(
  room: GameRoom,
  connection: WebSocket,
  state: GameState,
  event: {
    playerId: PlayerId;
    type: PersistedGameEventType;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  const nextVersion = room.version + 1;

  try {
    await persistence.persistAcceptedUpdate({
      matchId: room.matchId,
      version: nextVersion,
      state,
      event,
      playerUserIds: room.playerUserIds,
    });
  } catch (error) {
    console.warn("Game command persistence failed", {
      matchId: room.matchId,
      version: nextVersion,
      eventType: event.type,
      error,
    });
    rejectCommand(connection, "persistence_failed", room);
    return;
  }

  room.state = state;
  room.version = nextVersion;
  broadcastSnapshot(room);
}

function createNamedGame(targetScore: number, participants: [GameParticipant, GameParticipant]): GameState {
  const game = createGame(targetScore);
  const names = Object.fromEntries(participants.map((participant) => [participant.seat, participant.username]));

  return {
    ...game,
    players: {
      "player-one": { ...game.players["player-one"], name: names[0] ?? "Player One" },
      "player-two": { ...game.players["player-two"], name: names[1] ?? "Player Two" },
    },
  };
}

function createPlayerUserIdMap(participants: [GameParticipant, GameParticipant]): Record<PlayerId, number> {
  const seats = Object.fromEntries(participants.map((participant) => [participant.seat, participant.userId]));

  return {
    "player-one": seats[0],
    "player-two": seats[1],
  };
}

function canApplyCommand(room: GameRoom, connection: WebSocket, baseVersion: number): boolean {
  if (baseVersion === room.version) return true;

  rejectCommand(connection, "version_mismatch", room);
  return false;
}

function rejectCommand(connection: WebSocket, reason: string, room: GameRoom): void {
  sendJson(connection, {
    type: "command_rejected",
    reason,
    currentVersion: room.version,
  });
  sendSnapshot(connection, room);
}

function shuffleCurrentRack(state: GameState): GameState {
  if (state.status === "finished") return state;

  return {
    ...state,
    players: {
      ...state.players,
      [state.currentPlayerId]: {
        ...state.players[state.currentPlayerId],
        rack: shuffleTiles(state.players[state.currentPlayerId].rack),
      },
    },
  };
}

function createSubmitWordEvent(
  room: GameRoom,
  playerId: PlayerId,
  word: string,
  state: GameState,
): {
  playerId: PlayerId;
  type: PersistedGameEventType;
  payload: Record<string, unknown>;
} {
  return {
    playerId,
    type: state.status === "finished" ? "match_finished" : "word_submitted",
    payload: {
      word,
      playedWord: state.playedWords[0] ?? null,
      winnerUserId: state.winnerId ? room.playerUserIds[state.winnerId] : null,
    },
  };
}

function parseSocketMessage(message: string): z.infer<typeof socketMessageSchema> | null {
  try {
    const input = JSON.parse(message) as unknown;
    const result = socketMessageSchema.safeParse(input);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function broadcastSnapshot(room: GameRoom): void {
  for (const connection of room.connections) {
    sendSnapshot(connection, room);
  }
}

function sendSnapshot(connection: WebSocket, room: GameRoom): void {
  sendJson(connection, {
    type: "snapshot",
    matchId: room.matchId,
    state: room.state,
    version: room.version,
  });
}

function sendJson(connection: WebSocket, body: unknown): void {
  connection.send(JSON.stringify(body));
}
