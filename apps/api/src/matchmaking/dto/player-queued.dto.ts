import type { Region } from "@qtime/types";

export class PlayerQueuedDto {
  userId: number;
  startTime: string;
  region: Region;
  elo: number;
}
