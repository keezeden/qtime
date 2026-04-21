import { MATCHMAKING_QUEUE_NAME } from "@qtime/types";
import type { MatchmakingPair, QueuedPlayer } from "@qtime/types";
import { Job, Queue } from "bullmq";
import {
  createGameInitializationRequest,
  createGameServerConnection,
  GameServerClient,
  type CreateGameResponse,
} from "./game-server-client";
import { MatchPersistence } from "./match-persistence";
import { getTenSecondBlocksSince } from "./utils";

const POLL_INTERVAL_MS = Number(process.env.MATCHMAKING_POLL_INTERVAL_MS ?? 2000);
const GAME_SERVER_MAX_ATTEMPTS = 3;
const GAME_SERVER_RETRY_DELAY_MS = 500;
const GAME_SERVER_REQUEST_TIMEOUT_MS = 5000;
const MULTIPLAYER_TARGET_SCORE = 50;

class MatchmakingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MatchmakingConfigurationError";
  }
}

function createQueue(): Queue<QueuedPlayer> {
  return new Queue<QueuedPlayer>(MATCHMAKING_QUEUE_NAME, {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
}

const createPair = (player: QueuedPlayer, opponent: QueuedPlayer): MatchmakingPair => ({
  mode: player.mode,
  region: player.region,
  players: [player, opponent],
  matchedAt: new Date().toISOString(),
});

const canMatch = (player: QueuedPlayer, opponent: QueuedPlayer): boolean => {
  if (opponent.userId === player.userId) return false;
  if (opponent.region !== player.region) return false;
  if (opponent.mode !== player.mode) return false;

  const waitMultiplier = getTenSecondBlocksSince(player.queuedAt);
  const eloWindow = waitMultiplier * 50;
  const eloDifference = Math.abs(player.elo - opponent.elo);

  return eloDifference <= eloWindow;
};

export const getQueueKey = (player: QueuedPlayer): string => `${player.mode}:${player.region}`;

export const groupPlayersByModeAndRegion = (
  players: QueuedPlayer[],
): Record<string, QueuedPlayer[]> =>
  players.reduce(
    (acc, player) => {
      const key = getQueueKey(player);
      const queue = acc[key] ?? [];

      return {
        ...acc,
        [key]: [...queue, player],
      };
    },
    {} as Record<string, QueuedPlayer[]>,
  );

export const findMatches = (queue: QueuedPlayer[]): MatchmakingPair[] => {
  const matches: MatchmakingPair[] = [];
  const matchedUserIds = new Set<number>();

  const sorted = [...queue].sort((a, b) => {
    const aDate = new Date(a.queuedAt).getTime();
    const bDate = new Date(b.queuedAt).getTime();
    return aDate - bDate;
  });

  for (const player of sorted) {
    if (matchedUserIds.has(player.userId)) continue;

    const opponent = sorted.find((candidate) => {
      if (matchedUserIds.has(candidate.userId)) return false;
      return canMatch(player, candidate);
    });

    if (opponent) {
      matches.push(createPair(player, opponent));
      matchedUserIds.add(player.userId);
      matchedUserIds.add(opponent.userId);
    }
  }

  return matches;
};

export const getGroupedMatches = (
  groupedQueues: Record<string, QueuedPlayer[]>,
): MatchmakingPair[] => {
  const matches: MatchmakingPair[] = [];
  const entries = Object.entries(groupedQueues);

  for (const [, queue] of entries) {
    const regionMatches = findMatches(queue);
    matches.push(...regionMatches);
  }

  return matches;
};

const getMatchedJobs = (
  waitingJobs: Job<QueuedPlayer>[],
  match: MatchmakingPair,
): Job<QueuedPlayer>[] => {
  const matchedUserIds = new Set(match.players.map((player) => player.userId));

  return waitingJobs.filter((job) => matchedUserIds.has(job.data.userId));
};

const removeMatchedJobs = async (
  waitingJobs: Job<QueuedPlayer>[],
  match: MatchmakingPair,
): Promise<void> => {
  const matchedJobs = getMatchedJobs(waitingJobs, match);

  await Promise.all(matchedJobs.map((job) => job.remove()));
};

const getRequiredEnvironmentValue = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new MatchmakingConfigurationError(`${name} must be set before starting the matchmaking worker.`);
  }

  return value;
};

const createGameServerClient = (): GameServerClient =>
  new GameServerClient({
    baseUrl: getRequiredEnvironmentValue("GAME_SERVER_URL"),
    maxAttempts: GAME_SERVER_MAX_ATTEMPTS,
    retryDelayMs: GAME_SERVER_RETRY_DELAY_MS,
    requestTimeoutMs: GAME_SERVER_REQUEST_TIMEOUT_MS,
  });

const getGameServerPublicUrl = (): string =>
  process.env.GAME_SERVER_PUBLIC_URL ?? getRequiredEnvironmentValue("GAME_SERVER_URL");

const cancelPersistedMatch = async (
  persistence: MatchPersistence,
  matchId: number,
  match: MatchmakingPair,
): Promise<void> => {
  try {
    await persistence.cancelMatch(matchId, "game_server_initialization_failed");
  } catch (error) {
    console.warn("Failed to cancel match after game server initialization failure", {
      matchId,
      mode: match.mode,
      region: match.region,
      playerUserIds: match.players.map((player) => player.userId),
      error,
    });
  }
};

const initializeGameRoom = async (
  matchId: number,
  match: MatchmakingPair,
  gameServerClient: GameServerClient,
): Promise<CreateGameResponse> => {
  const request = createGameInitializationRequest(matchId, match, MULTIPLAYER_TARGET_SCORE);
  return gameServerClient.createGame(request);
};

const persistMatches = async (
  waitingJobs: Job<QueuedPlayer>[],
  matches: MatchmakingPair[],
  persistence: MatchPersistence,
  gameServerClient: GameServerClient,
): Promise<void> => {
  for (const match of matches) {
    const matchId = await persistence.persistPair(match);
    let game: CreateGameResponse;

    try {
      game = await initializeGameRoom(matchId, match, gameServerClient);
      await persistence.saveGameServerConnection(
        matchId,
        createGameServerConnection(getGameServerPublicUrl(), game),
      );
    } catch (error) {
      await cancelPersistedMatch(persistence, matchId, match);
      throw error;
    }

    await removeMatchedJobs(waitingJobs, match);
    console.log("Match persisted", {
      matchId,
      mode: match.mode,
      region: match.region,
      playerUserIds: match.players.map((player) => player.userId),
      gameServerWebsocketPath: game.websocketPath,
    });
  }
};

const processQueue = async (
  queue: Queue<QueuedPlayer>,
  persistence: MatchPersistence,
  gameServerClient: GameServerClient,
): Promise<void> => {
  const waitingJobs = await queue.getWaiting();
  const groupedQueues = groupPlayersByModeAndRegion(waitingJobs.map((job) => job.data));
  const matches = getGroupedMatches(groupedQueues);

  await persistMatches(waitingJobs, matches, persistence, gameServerClient);
};

const startWorker = (): void => {
  const queue = createQueue();
  const persistence = new MatchPersistence();
  const gameServerClient = createGameServerClient();
  let currentRun: Promise<void> | undefined;

  const poll = (): void => {
    if (currentRun) return;

    currentRun = processQueue(queue, persistence, gameServerClient)
      .catch((error) => {
        console.error("Matchmaking poll failed:", error);
      })
      .finally(() => {
        currentRun = undefined;
      });
  };

  const interval = setInterval(poll, POLL_INTERVAL_MS);
  poll();

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    console.log(`Received ${signal}; shutting down matchmaking worker.`);
    clearInterval(interval);

    await currentRun;
    await persistence.close();
    await queue.close();
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
};

if (process.env.NODE_ENV !== "test") {
  startWorker();
}
