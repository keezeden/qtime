import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGameEventDto } from './dto/create-game-event.dto';
import type { FindCurrentMatchDto } from './dto/find-current-match.dto';
import type { ListGameEventsDto } from './dto/list-game-events.dto';
import { GAME_EVENT_TYPES, type GameEventType } from './game-event-types';
import { finishMatch } from './match-finalization';
import type {
  CurrentMatchResponse,
  GameEventAcceptedResponse,
  GameEventsResponse,
  MatchResponse,
  MatchStateResponse,
} from './types/match-response';

const participantSelect = {
  userId: true,
  seat: true,
  usernameSnapshot: true,
  eloSnapshot: true,
  result: true,
} as const;

const matchSelect = {
  id: true,
  mode: true,
  region: true,
  status: true,
  createdAt: true,
  startedAt: true,
  finishedAt: true,
  matchParticipants: {
    select: participantSelect,
    orderBy: { seat: 'asc' },
  },
} as const;

const gameStateSelect = {
  matchId: true,
  version: true,
  status: true,
  state: true,
  updatedAt: true,
} as const;

const gameEventSelect = {
  id: true,
  matchId: true,
  version: true,
  userId: true,
  type: true,
  payload: true,
  createdAt: true,
} as const;

type MatchRecord = Prisma.MatchGetPayload<{ select: typeof matchSelect }>;
type GameStateRecord = Prisma.GameStateGetPayload<{ select: typeof gameStateSelect }>;
type GameEventRecord = Prisma.GameEventGetPayload<{ select: typeof gameEventSelect }>;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(userId: number, query: FindCurrentMatchDto): Promise<CurrentMatchResponse> {
    const startedAfter = this.parseStartedAfter(query);
    const match = await this.prisma.match.findFirst({
      where: {
        status: MatchStatus.ACTIVE,
        ...(startedAfter ? { startedAt: { gte: startedAfter } } : {}),
        matchParticipants: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: matchSelect,
    });

    return { match: match ? this.serializeMatch(match) : null };
  }

  private parseStartedAfter(query: FindCurrentMatchDto): Date | null {
    return query.startedAfter ? new Date(query.startedAfter) : null;
  }

  async findOne(matchId: number, userId: number): Promise<MatchResponse> {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        matchParticipants: {
          some: { userId },
        },
      },
      select: matchSelect,
    });

    if (!match) {
      throw new NotFoundException('Match was not found for the authenticated user.');
    }

    return { match: this.serializeMatch(match) };
  }

  async findState(matchId: number, userId: number): Promise<MatchStateResponse> {
    await this.ensureParticipant(matchId, userId);

    const gameState = await this.prisma.gameState.findUnique({
      where: { matchId },
      select: gameStateSelect,
    });

    if (!gameState) {
      throw new NotFoundException('Game state was not found for the match.');
    }

    return { state: this.serializeGameState(gameState) };
  }

  async findEvents(matchId: number, userId: number, query: ListGameEventsDto): Promise<GameEventsResponse> {
    await this.ensureParticipant(matchId, userId);

    const events = await this.prisma.gameEvent.findMany({
      where: {
        matchId,
        version: {
          gt: query.afterVersion ?? 0,
        },
      },
      orderBy: { version: 'asc' },
      select: gameEventSelect,
    });

    return { events: events.map((event) => this.serializeGameEvent(event)) };
  }

  async createEvent(matchId: number, userId: number, input: CreateGameEventDto): Promise<GameEventAcceptedResponse> {
    const result = await this.prisma.$transaction(async (transaction) => {
      await this.ensureActiveParticipant(transaction, matchId, userId);

      const gameState = await transaction.gameState.findUnique({
        where: { matchId },
        select: gameStateSelect,
      });

      if (!gameState) {
        throw new NotFoundException('Game state was not found for the match.');
      }

      if (gameState.version !== input.baseVersion) {
        throw new ConflictException('Game state version does not match the submitted baseVersion.');
      }

      const nextVersion = input.baseVersion + 1;
      const event = await transaction.gameEvent.create({
        data: { matchId, version: nextVersion, userId, type: input.type, payload: input.payload },
        select: gameEventSelect,
      });

      const updatedState = await transaction.gameState.update({
        where: { matchId },
        data: {
          version: nextVersion,
          status: input.stateStatus,
          state: input.nextState,
        },
        select: gameStateSelect,
      });

      if (input.type === 'match_finished') await finishMatch(transaction, matchId, input.nextState);

      return { event, state: updatedState };
    });

    return {
      event: this.serializeGameEvent(result.event),
      state: this.serializeGameState(result.state),
    };
  }

  private async ensureParticipant(matchId: number, userId: number): Promise<void> {
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        matchParticipants: {
          some: { userId },
        },
      },
      select: { id: true },
    });

    if (!match) {
      throw new NotFoundException('Match was not found for the authenticated user.');
    }
  }

  private async ensureActiveParticipant(
    transaction: Prisma.TransactionClient,
    matchId: number,
    userId: number,
  ): Promise<void> {
    const match = await transaction.match.findFirst({
      where: {
        id: matchId,
        status: MatchStatus.ACTIVE,
        matchParticipants: {
          some: { userId },
        },
      },
      select: { id: true },
    });

    if (!match) {
      throw new NotFoundException('Active match was not found for the authenticated user.');
    }
  }

  private serializeMatch(match: MatchRecord): MatchResponse['match'] {
    return {
      ...match,
      createdAt: match.createdAt.toISOString(),
      startedAt: match.startedAt ? match.startedAt.toISOString() : null,
      finishedAt: match.finishedAt ? match.finishedAt.toISOString() : null,
    };
  }

  private serializeGameState(gameState: GameStateRecord): MatchStateResponse['state'] {
    return {
      ...gameState,
      updatedAt: gameState.updatedAt.toISOString(),
    };
  }

  private serializeGameEvent(event: GameEventRecord): GameEventsResponse['events'][number] {
    return {
      ...event,
      type: this.toGameEventType(event.type),
      createdAt: event.createdAt.toISOString(),
    };
  }

  private toGameEventType(type: string): GameEventType {
    if (GAME_EVENT_TYPES.includes(type as GameEventType)) {
      return type as GameEventType;
    }

    throw new Error(`Persisted game event has unsupported type: ${type}`);
  }
}
