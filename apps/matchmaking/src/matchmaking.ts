import { PlayerQueuedEvent, Region } from "@qtime/types";
import { Queue } from "bullmq";
import { getTenSecondBlocksSince } from "./utils";

const MATCHMAKING_QUEUE_NAME = process.env.MATCHMAKING_QUEUE_NAME ?? "matchmaking";

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

if (process.env.NODE_ENV !== "test") {
  const queue = createQueue();
  setInterval(() => {
    void processQueue(queue);
  }, 2000);
}
