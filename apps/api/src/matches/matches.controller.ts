import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthUser } from '../auth/types/auth-user';
import { MatchesService } from './matches.service';
import type { CurrentMatchResponse, MatchResponse, MatchStateResponse } from './types/match-response';

@Controller('matches')
@UseGuards(AccessTokenGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('current')
  current(@CurrentUser() user: AuthUser): Promise<CurrentMatchResponse> {
    return this.matchesService.findCurrent(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ): Promise<MatchResponse> {
    return this.matchesService.findOne(id, user.id);
  }

  @Get(':id/state')
  findState(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ): Promise<MatchStateResponse> {
    return this.matchesService.findState(id, user.id);
  }
}
