import { Test, TestingModule } from '@nestjs/testing';
import { MatchResult, MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from './matches.service';

type PrismaMock = {
  $transaction: jest.Mock;
  match: {
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  matchParticipant: {
    findMany: jest.Mock;
    update: jest.Mock;
  };
  ratingHistory: {
    create: jest.Mock;
  };
  user: {
    update: jest.Mock;
  };
  gameState: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  gameEvent: {
    create: jest.Mock;
  };
};

describe('MatchesService terminal events', () => {
  let service: MatchesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      match: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      matchParticipant: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      ratingHistory: {
        create: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
      gameState: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      gameEvent: {
        create: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('finishes the match and records participant results for terminal events', async () => {
    prisma.match.findFirst.mockResolvedValue({ id: 1 });
    prisma.gameState.findUnique.mockResolvedValue({
      matchId: 1,
      version: 0,
      status: 'active',
      state: { phase: 'ready' },
      updatedAt: new Date('2026-01-01T00:00:02.000Z'),
    });
    prisma.gameEvent.create.mockResolvedValue({
      id: 10,
      matchId: 1,
      version: 1,
      userId: 1,
      type: 'match_finished',
      payload: { winnerUserId: 1 },
      createdAt: new Date('2026-01-01T00:00:03.000Z'),
    });
    prisma.gameState.update.mockResolvedValue({
      matchId: 1,
      version: 1,
      status: 'finished',
      state: { phase: 'finished', winnerUserId: 1 },
      updatedAt: new Date('2026-01-01T00:00:03.000Z'),
    });
    prisma.matchParticipant.findMany.mockResolvedValue([
      { userId: 1, user: { rating: 1200 } },
      { userId: 2, user: { rating: 1200 } },
    ]);
    prisma.match.update.mockResolvedValue({ id: 1 });
    prisma.matchParticipant.update.mockResolvedValue({ matchId: 1, userId: 1 });
    prisma.user.update.mockResolvedValue({ id: 1 });
    prisma.ratingHistory.create.mockResolvedValue({ id: 1 });

    await expect(
      service.createEvent(1, 1, {
        baseVersion: 0,
        type: 'match_finished',
        payload: { winnerUserId: 1 },
        stateStatus: 'finished',
        nextState: { phase: 'finished', winnerUserId: 1 },
      }),
    ).resolves.toEqual({
      event: {
        id: 10,
        matchId: 1,
        version: 1,
        userId: 1,
        type: 'match_finished',
        payload: { winnerUserId: 1 },
        createdAt: '2026-01-01T00:00:03.000Z',
      },
      state: {
        matchId: 1,
        version: 1,
        status: 'finished',
        state: { phase: 'finished', winnerUserId: 1 },
        gameConnection: null,
        updatedAt: '2026-01-01T00:00:03.000Z',
      },
    });
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: MatchStatus.FINISHED,
        finishedAt: expect.any(Date),
      },
      select: { id: true },
    });
    expect(prisma.matchParticipant.update).toHaveBeenCalledWith({
      where: { matchId_userId: { matchId: 1, userId: 1 } },
      data: { result: MatchResult.WIN },
      select: { matchId: true, userId: true },
    });
    expect(prisma.matchParticipant.update).toHaveBeenCalledWith({
      where: { matchId_userId: { matchId: 1, userId: 2 } },
      data: { result: MatchResult.LOSS },
      select: { matchId: true, userId: true },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { rating: 1216 },
      select: { id: true },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { rating: 1184 },
      select: { id: true },
    });
    expect(prisma.ratingHistory.create).toHaveBeenCalledWith({
      data: {
        matchId: 1,
        userId: 1,
        oldRating: 1200,
        newRating: 1216,
        delta: 16,
        algorithm: 'elo-v1',
      },
      select: { id: true },
    });
  });
});
