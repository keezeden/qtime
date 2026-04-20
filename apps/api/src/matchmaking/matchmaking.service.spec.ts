import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingService } from './matchmaking.service';
import { EventsService } from '../events/events.service';

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

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue a matchmaking queued event payload', async () => {
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2026-01-01T00:00:00.000Z');

    const input = {
      region: 'oce' as const,
      mode: 'word-duel' as const,
    };
    const user = {
      id: 42,
      username: 'keez',
      nametag: null,
    };

    await expect(service.queueMatchmaking(input, user)).resolves.toEqual({ jobId: 'job-1' });
    expect(eventsService.pushMatchmaking).toHaveBeenCalledWith({
      userId: 42,
      username: 'keez',
      region: 'oce',
      elo: 1200,
      mode: 'word-duel',
      queuedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('should enqueue synthetic players through the dev endpoint service', async () => {
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2026-01-01T00:00:00.000Z');

    await expect(
      service.queueDevMatchmaking({
        userId: 100,
        username: 'synthetic',
        region: 'na',
        elo: 1300,
        mode: 'word-duel',
      }),
    ).resolves.toEqual({ jobId: 'job-1' });

    expect(eventsService.pushMatchmaking).toHaveBeenCalledWith({
      userId: 100,
      username: 'synthetic',
      region: 'na',
      elo: 1300,
      mode: 'word-duel',
      queuedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('should reject synthetic queueing in production', async () => {
    process.env.NODE_ENV = 'production';

    await expect(
      service.queueDevMatchmaking({
        userId: 100,
        username: 'synthetic',
        region: 'na',
        elo: 1300,
        mode: 'word-duel',
      }),
    ).rejects.toThrow('Dev matchmaking endpoint is unavailable in production.');
    expect(eventsService.pushMatchmaking).not.toHaveBeenCalled();

  });
});
