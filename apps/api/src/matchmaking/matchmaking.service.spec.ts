import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';
import { EventsService } from '../events/events.service';
import { MATCHMAKING_QUEUED_JOB_NAME } from '../events/queue.constants';

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let eventsService: { pushMatchmaking: jest.Mock };

  beforeEach(async () => {
    eventsService = {
      pushMatchmaking: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        {
          provide: EventsService,
          useValue: eventsService,
        },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue a matchmaking queued event payload', async () => {
    const player = {
      userId: 42,
      startTime: '2026-01-01T00:00:00.000Z',
      region: 'oce' as const,
      elo: 1200,
    };

    await expect(service.queueMatchmaking(player)).resolves.toEqual({ jobId: 'job-1' });
    expect(eventsService.pushMatchmaking).toHaveBeenCalledWith(MATCHMAKING_QUEUED_JOB_NAME, {
      jobType: MATCHMAKING_QUEUED_JOB_NAME,
      ...player,
    });
  });
});
