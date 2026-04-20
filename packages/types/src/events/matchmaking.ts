import type { Region } from "../user";

export type MatchmakingMode = "word-duel";

export type QueuedPlayer = {
  userId: number;
  username: string;
  region: Region;
  elo: number;
  mode: MatchmakingMode;
  queuedAt: string;
};

export type MatchmakingPair = {
  mode: MatchmakingMode;
  region: Region;
  players: [QueuedPlayer, QueuedPlayer];
  matchedAt: string;
};

export const MATCHMAKING_QUEUE_NAME = "matchmaking";
