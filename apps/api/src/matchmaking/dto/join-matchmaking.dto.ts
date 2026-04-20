import type { MatchmakingMode, Region } from "@qtime/types";
import { IsIn } from "class-validator";

export class JoinMatchmakingDto {
  @IsIn(["oce", "na", "eu", "asia"])
  region: Region = "oce";

  @IsIn(["word-duel"])
  mode: MatchmakingMode = "word-duel";
}
