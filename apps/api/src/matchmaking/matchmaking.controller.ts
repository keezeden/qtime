import { Body, Controller, Post } from "@nestjs/common";
import { MatchmakingService } from "./matchmaking.service";
import { PlayerQueuedDto } from "./dto/player-queued.dto";

@Controller("matchmaking")
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post()
  create(@Body() playerQueuedDto: PlayerQueuedDto) {
    return this.matchmakingService.queueMatchmaking(playerQueuedDto);
  }
}
