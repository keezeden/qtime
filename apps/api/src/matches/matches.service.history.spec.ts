import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from './matches.service';

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
  };
  match: {
    findMany: jest.Mock;
  };
};

describe('MatchesService history', () => {
  let service: MatchesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      match: {
        findMany: jest.fn(),
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

  it('returns match history with rating summary', async () => {
    prisma.user.findUnique.mockResolvedValue({ rating: 1216 });
    prisma.match.findMany.mockResolvedValue([
      {
        id: 1,
        finishedAt: new Date('2026-01-01T00:05:00.000Z'),
        gameState: {
          state: {
            players: {
              'player-one': { score: 52 },
              'player-two': { score: 30 },
            },
          },
        },
        matchParticipants: [
          { userId: 1, seat: 0, usernameSnapshot: 'one', result: 'WIN' },
          { userId: 2, seat: 1, usernameSnapshot: 'two', result: 'LOSS' },
        ],
        ratingHistory: [{ userId: 1, oldRating: 1200, newRating: 1216, delta: 16 }],
      },
    ]);

    await expect(service.findHistory(1)).resolves.toEqual({
      summary: {
        rating: 1216,
        wins: 1,
        losses: 0,
        totalMatches: 1,
        winRate: 100,
      },
      matches: [
        {
          id: 1,
          opponentName: 'two',
          result: 'WIN',
          ratingDelta: 16,
          oldRating: 1200,
          newRating: 1216,
          finishedAt: '2026-01-01T00:05:00.000Z',
          finalScore: 52,
          opponentScore: 30,
        },
      ],
    });
    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: MatchStatus.FINISHED }),
      }),
    );
  });
});
