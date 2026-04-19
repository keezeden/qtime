import { Region } from "../user";

export type PlayerQueuedEvent = {
  jobType: "matchmaking.queued";
  userId: number;
  startTime: string;
  region: Region;
  elo: number;
};
