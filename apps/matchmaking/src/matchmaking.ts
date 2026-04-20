import { MATCHMAKING_QUEUE_NAME } from "@qtime/types";
import type { MatchmakingPair, QueuedPlayer } from "@qtime/types";
import { Queue } from "bullmq";
import { getTenSecondBlocksSince } from "./utils";

const POLL_INTERVAL_MS = Number(process.env.MATCHMAKING_POLL_INTERVAL_MS ?? 2000);

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

const processQueue = async (queue: Queue<QueuedPlayer>): Promise<void> => {
  const players = await queue.getWaiting();
  const groupedQueues = groupPlayersByModeAndRegion(players.map((player) => player.data));
  const matches = getGroupedMatches(groupedQueues);

  console.log("Matches found: ", matches);
};

const startWorker = (): void => {
  const queue = createQueue();
  let currentRun: Promise<void> | undefined;

  const poll = (): void => {
    if (currentRun) return;

    currentRun = processQueue(queue)
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
    await queue.close();
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
};

if (process.env.NODE_ENV !== "test") {
  startWorker();
}
