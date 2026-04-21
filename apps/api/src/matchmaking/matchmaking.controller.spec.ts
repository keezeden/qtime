import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { EventsService } from '../events/events.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('MatchmakingController', () => {
  let controller: MatchmakingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakingController],
      providers: [
        MatchmakingService,
        {
          provide: EventsService,
          useValue: {
            pushMatchmaking: jest.fn(),
            removeMatchmakingJob: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MatchmakingController>(MatchmakingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
