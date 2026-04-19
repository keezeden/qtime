import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlayerQueuedDto } from "./dto/player-queued.dto";
import { EventsService } from "../events/events.service";
import type { PlayerQueuedEvent } from "@qtime/types";
import { MATCHMAKING_QUEUED_JOB_NAME } from "../events/queue.constants";

@Injectable()
export class MatchmakingService {
  constructor(private events: EventsService) {}

  async queueMatchmaking(player: PlayerQueuedDto): Promise<{ jobId: string }> {
    const payload: PlayerQueuedEvent = {
      jobType: MATCHMAKING_QUEUED_JOB_NAME,
      ...player,
    };
    const job = await this.events.pushMatchmaking(MATCHMAKING_QUEUED_JOB_NAME, payload);

    if (!job.id) throw new InternalServerErrorException("Queue player failed.");

    return { jobId: job.id };
  }
}
