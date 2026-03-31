import { Region } from "../user";

export type PlayerQueuedEvent = {
  jobType: "matchmaking:queued";
  userId: number;
  startTime: Date;
  region: Region;
  elo: number;
};
