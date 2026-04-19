import type { Region } from "@qtime/types";
import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, Min } from "class-validator";

export class PlayerQueuedDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @IsDateString()
  startTime: string;

  @IsIn(["oce", "us", "eu", "asia"])
  region: Region;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  elo: number;
}
