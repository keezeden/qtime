import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlayerQueuedDto } from "./dto/player-queued.dto";
import { EventsService } from "src/events/events.service";

@Injectable()
export class MatchmakingService {
  constructor(private events: EventsService) {}

  async queuePlayer(player: PlayerQueuedDto): Promise<{ jobId: string }> {
    const job = await this.events.push("player.queued", player);

    if (!job.id) throw new InternalServerErrorException("Queue player failed.");

    return { jobId: job.id };
  }
}
