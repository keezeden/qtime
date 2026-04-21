import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MATCHMAKING_QUEUE_NAME } from '@qtime/types';

describe('EventsService', () => {
  let service: EventsService;
  let queue: { add: jest.Mock; getJob: jest.Mock };

  beforeEach(async () => {
    queue = {
      add: jest.fn(),
      getJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getQueueToken(MATCHMAKING_QUEUE_NAME),
          useValue: queue,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should remove a waiting matchmaking job', async () => {
    const job = {
      data: { userId: 42 },
      getState: jest.fn().mockResolvedValue('waiting'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    queue.getJob.mockResolvedValue(job);

    await expect(service.removeMatchmakingJob('job-1', 42)).resolves.toBe(true);
    expect(job.remove).toHaveBeenCalled();
  });

  it('should not remove active matchmaking jobs', async () => {
    const job = {
      data: { userId: 42 },
      getState: jest.fn().mockResolvedValue('active'),
      remove: jest.fn(),
    };
    queue.getJob.mockResolvedValue(job);

    await expect(service.removeMatchmakingJob('job-1', 42)).resolves.toBe(false);
    expect(job.remove).not.toHaveBeenCalled();
  });

  it('should not remove another user queued job', async () => {
    const job = {
      data: { userId: 7 },
      getState: jest.fn(),
      remove: jest.fn(),
    };
    queue.getJob.mockResolvedValue(job);

    await expect(service.removeMatchmakingJob('job-1', 42)).resolves.toBe(false);
    expect(job.getState).not.toHaveBeenCalled();
    expect(job.remove).not.toHaveBeenCalled();
  });
});
