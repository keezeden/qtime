import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from './matches.service';

type PrismaMock = {
  $transaction: jest.Mock;
  match: {
    findFirst: jest.Mock;
  };
  gameState: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  gameEvent: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

const makeMatch = () => ({
  id: 1,
  mode: 'word-duel',
  region: 'oce',
  status: MatchStatus.ACTIVE,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  startedAt: new Date('2026-01-01T00:00:01.000Z'),
  finishedAt: null,
  matchParticipants: [
    {
      userId: 1,
      seat: 0,
      usernameSnapshot: 'one',
      eloSnapshot: 1200,
      result: null,
    },
    {
      userId: 2,
      seat: 1,
      usernameSnapshot: 'two',
      eloSnapshot: 1200,
      result: null,
    },
  ],
});

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      match: {
        findFirst: jest.fn(),
      },
      gameState: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      gameEvent: {
        findMany: jest.fn(),
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

  it('returns the current active match for a participant', async () => {
    prisma.match.findFirst.mockResolvedValue(makeMatch());

    await expect(service.findCurrent(1)).resolves.toEqual({
      match: {
        id: 1,
        mode: 'word-duel',
        region: 'oce',
        status: MatchStatus.ACTIVE,
        createdAt: '2026-01-01T00:00:00.000Z',
        startedAt: '2026-01-01T00:00:01.000Z',
        finishedAt: null,
        matchParticipants: [
          {
            userId: 1,
            seat: 0,
            usernameSnapshot: 'one',
            eloSnapshot: 1200,
            result: null,
          },
          {
            userId: 2,
            seat: 1,
            usernameSnapshot: 'two',
            eloSnapshot: 1200,
            result: null,
          },
        ],
      },
    });
    expect(prisma.match.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: MatchStatus.ACTIVE,
          matchParticipants: { some: { userId: 1 } },
        }),
      }),
    );
  });

  it('returns null when the participant has no active match', async () => {
    prisma.match.findFirst.mockResolvedValue(null);

    await expect(service.findCurrent(1)).resolves.toEqual({ match: null });
  });

  it('rejects match reads for non-participants', async () => {
    prisma.match.findFirst.mockResolvedValue(null);

    await expect(service.findOne(1, 3)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns state after confirming participant access', async () => {
    prisma.match.findFirst.mockResolvedValue({ id: 1 });
    prisma.gameState.findUnique.mockResolvedValue({
      matchId: 1,
      version: 0,
      status: 'active',
      state: { phase: 'ready' },
      updatedAt: new Date('2026-01-01T00:00:02.000Z'),
    });

    await expect(service.findState(1, 1)).resolves.toEqual({
      state: {
        matchId: 1,
        version: 0,
        status: 'active',
        state: { phase: 'ready' },
        updatedAt: '2026-01-01T00:00:02.000Z',
      },
    });
    expect(prisma.gameState.findUnique).toHaveBeenCalledWith({
      where: { matchId: 1 },
      select: expect.any(Object),
    });
  });

  it('returns events after the requested version for a participant', async () => {
    prisma.match.findFirst.mockResolvedValue({ id: 1 });
    prisma.gameEvent.findMany.mockResolvedValue([
      {
        id: 10,
        matchId: 1,
        version: 2,
        userId: 1,
        type: 'word_submitted',
        payload: { word: 'crane' },
        createdAt: new Date('2026-01-01T00:00:03.000Z'),
      },
    ]);

    await expect(service.findEvents(1, 1, { afterVersion: 1 })).resolves.toEqual({
      events: [
        {
          id: 10,
          matchId: 1,
          version: 2,
          userId: 1,
          type: 'word_submitted',
          payload: { word: 'crane' },
          createdAt: '2026-01-01T00:00:03.000Z',
        },
      ],
    });
    expect(prisma.gameEvent.findMany).toHaveBeenCalledWith({
      where: {
        matchId: 1,
        version: { gt: 1 },
      },
      orderBy: { version: 'asc' },
      select: expect.any(Object),
    });
  });

  it('creates an event and advances game state in one transaction', async () => {
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
      type: 'word_submitted',
      payload: { word: 'crane' },
      createdAt: new Date('2026-01-01T00:00:03.000Z'),
    });
    prisma.gameState.update.mockResolvedValue({
      matchId: 1,
      version: 1,
      status: 'active',
      state: { phase: 'submitted' },
      updatedAt: new Date('2026-01-01T00:00:03.000Z'),
    });

    await expect(
      service.createEvent(1, 1, {
        baseVersion: 0,
        type: 'word_submitted',
        payload: { word: 'crane' },
        stateStatus: 'active',
        nextState: { phase: 'submitted' },
      }),
    ).resolves.toEqual({
      event: {
        id: 10,
        matchId: 1,
        version: 1,
        userId: 1,
        type: 'word_submitted',
        payload: { word: 'crane' },
        createdAt: '2026-01-01T00:00:03.000Z',
      },
      state: {
        matchId: 1,
        version: 1,
        status: 'active',
        state: { phase: 'submitted' },
        updatedAt: '2026-01-01T00:00:03.000Z',
      },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.gameEvent.create).toHaveBeenCalledWith({
      data: {
        matchId: 1,
        version: 1,
        userId: 1,
        type: 'word_submitted',
        payload: { word: 'crane' },
      },
      select: expect.any(Object),
    });
    expect(prisma.gameState.update).toHaveBeenCalledWith({
      where: { matchId: 1 },
      data: {
        version: 1,
        status: 'active',
        state: { phase: 'submitted' },
      },
      select: expect.any(Object),
    });
  });

  it('rejects stale event submissions', async () => {
    prisma.match.findFirst.mockResolvedValue({ id: 1 });
    prisma.gameState.findUnique.mockResolvedValue({
      matchId: 1,
      version: 2,
      status: 'active',
      state: { phase: 'ready' },
      updatedAt: new Date('2026-01-01T00:00:02.000Z'),
    });

    await expect(
      service.createEvent(1, 1, {
        baseVersion: 1,
        type: 'word_submitted',
        payload: { word: 'crane' },
        stateStatus: 'active',
        nextState: { phase: 'submitted' },
      }),
    ).rejects.toThrow('Game state version does not match the submitted baseVersion.');
    expect(prisma.gameEvent.create).not.toHaveBeenCalled();
    expect(prisma.gameState.update).not.toHaveBeenCalled();
  });
});
