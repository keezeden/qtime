import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthUser } from '../auth/types/auth-user';
import { CreateGameEventDto } from './dto/create-game-event.dto';
import { ListGameEventsDto } from './dto/list-game-events.dto';
import { MatchesService } from './matches.service';
import type {
  CurrentMatchResponse,
  GameEventAcceptedResponse,
  GameEventsResponse,
  MatchResponse,
  MatchStateResponse,
} from './types/match-response';

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

  @Get(':id/events')
  findEvents(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListGameEventsDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GameEventsResponse> {
    return this.matchesService.findEvents(id, user.id, query);
  }

  @Post(':id/events')
  createEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() createGameEventDto: CreateGameEventDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GameEventAcceptedResponse> {
    return this.matchesService.createEvent(id, user.id, createGameEventDto);
  }
}
