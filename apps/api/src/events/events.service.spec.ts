import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MATCHMAKING_QUEUE_NAME } from '@qtime/types';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getQueueToken(MATCHMAKING_QUEUE_NAME),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
