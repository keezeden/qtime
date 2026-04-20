import type { MatchmakingMode, Region } from "@qtime/types";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsString, Min, MinLength } from "class-validator";

export class DevJoinMatchmakingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @IsString()
  @MinLength(1)
  username: string;

  @IsIn(["oce", "na", "eu", "asia"])
  region: Region = "oce";

  @Type(() => Number)
  @IsInt()
  @Min(0)
  elo: number = 1200;

  @IsIn(["word-duel"])
  mode: MatchmakingMode = "word-duel";
}
