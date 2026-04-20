import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from './matches.service';

type PrismaMock = {
  match: {
    findFirst: jest.Mock;
  };
  gameState: {
    findUnique: jest.Mock;
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
      match: {
        findFirst: jest.fn(),
      },
      gameState: {
        findUnique: jest.fn(),
      },
    };

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
});
