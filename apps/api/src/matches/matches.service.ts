import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CurrentMatchResponse, MatchResponse, MatchStateResponse } from './types/match-response';

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

type MatchRecord = Prisma.MatchGetPayload<{ select: typeof matchSelect }>;
type GameStateRecord = Prisma.GameStateGetPayload<{ select: typeof gameStateSelect }>;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(userId: number): Promise<CurrentMatchResponse> {
    const match = await this.prisma.match.findFirst({
      where: {
        status: MatchStatus.ACTIVE,
        matchParticipants: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: matchSelect,
    });

    return { match: match ? this.serializeMatch(match) : null };
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
}
