import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlayerQueuedDto } from "./dto/player-queued.dto";
import { EventsService } from "../events/events.service";

@Injectable()
export class MatchmakingService {
  constructor(private events: EventsService) {}

  async queueMatchmaking(player: PlayerQueuedDto): Promise<{ jobId: string }> {
    const job = await this.events.pushMatchmaking("matchmaking.queued", player);

    if (!job.id) throw new InternalServerErrorException("Queue player failed.");

    return { jobId: job.id };
  }
}
