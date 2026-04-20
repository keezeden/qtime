import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { MatchmakingService } from "./matchmaking.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import type { AuthUser } from "../auth/types/auth-user";
import { DevJoinMatchmakingDto } from "./dto/dev-join-matchmaking.dto";
import { JoinMatchmakingDto } from "./dto/join-matchmaking.dto";

@Controller("matchmaking")
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(
    @Body() joinMatchmakingDto: JoinMatchmakingDto,
    @CurrentUser() user: AuthUser,
  ): Promise<{ jobId: string }> {
    return this.matchmakingService.queueMatchmaking(joinMatchmakingDto, user);
  }

  @Post("dev")
  createDev(@Body() devJoinMatchmakingDto: DevJoinMatchmakingDto): Promise<{ jobId: string }> {
    return this.matchmakingService.queueDevMatchmaking(devJoinMatchmakingDto);
  }
}
