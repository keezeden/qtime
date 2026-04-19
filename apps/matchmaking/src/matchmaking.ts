import type { PlayerQueuedEvent, Region } from "@qtime/types";
import { Queue } from "bullmq";
import { getTenSecondBlocksSince } from "./utils";

const MATCHMAKING_QUEUE_NAME = process.env.MATCHMAKING_QUEUE_NAME ?? "matchmaking";
const POLL_INTERVAL_MS = Number(process.env.MATCHMAKING_POLL_INTERVAL_MS ?? 2000);

function createQueue() {
  return new Queue<PlayerQueuedEvent>(MATCHMAKING_QUEUE_NAME, {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
}

export const findMatches = (region: Region, queue: PlayerQueuedEvent[]) => {
  const matches: PlayerQueuedEvent[][] = [];

  const sorted = queue.sort((a, b) => {
    const aDate = new Date(a.startTime).getTime();
    const bDate = new Date(b.startTime).getTime();
    return aDate - bDate;
  });

  for (const [playerIndex, player] of sorted.entries()) {
    const waitMultiplier = getTenSecondBlocksSince(player.startTime);
    const eloWindow = waitMultiplier * 50;

    for (const [opponentIndex, opponent] of sorted.entries()) {
      if (opponent.userId === player.userId) continue;

      const eloDifference = Math.abs(player.elo - opponent.elo);
      if (eloDifference > eloWindow) continue;

      matches.push([player, opponent]);
      sorted.splice(playerIndex, 1);
      sorted.splice(opponentIndex, 1);
    }
  }

  return matches;
};

export const getRegionMatches = (regionalQueues: Record<Region, PlayerQueuedEvent[]>) => {
  const matches: PlayerQueuedEvent[][] = [];
  const entries = Object.entries(regionalQueues) as [Region, PlayerQueuedEvent[]][];

  for (const [region, queue] of entries) {
    const regionMatches = findMatches(region, queue);
    matches.push(...regionMatches);
  }

  return matches;
};

const processQueue = async (queue: Queue<PlayerQueuedEvent>) => {
  const players = await queue.getWaiting();

  const regionalQueues = players.reduce(
    (acc, item) => {
      const region = item.data.region;
      const regionalQueue = acc[region] ?? [];

      regionalQueue.push(item.data);

      return acc;
    },
    {} as Record<Region, PlayerQueuedEvent[]>,
  );

  const matches = getRegionMatches(regionalQueues);

  console.log("Matches found: ", matches);
};

const startWorker = () => {
  const queue = createQueue();
  let currentRun: Promise<void> | undefined;

  const poll = () => {
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

  const shutdown = async (signal: NodeJS.Signals) => {
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
