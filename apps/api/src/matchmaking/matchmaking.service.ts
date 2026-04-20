import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DevJoinMatchmakingDto } from "./dto/dev-join-matchmaking.dto";
import { JoinMatchmakingDto } from "./dto/join-matchmaking.dto";
import { EventsService } from "../events/events.service";
import type { QueuedPlayer } from "@qtime/types";
import type { AuthUser } from "../auth/types/auth-user";

@Injectable()
export class MatchmakingService {
  constructor(private events: EventsService) {}

  async queueMatchmaking(
    input: JoinMatchmakingDto,
    user: AuthUser,
  ): Promise<{ jobId: string }> {
    const payload: QueuedPlayer = {
      userId: user.id,
      username: user.username,
      region: input.region,
      elo: 1200,
      mode: input.mode,
      queuedAt: new Date().toISOString(),
    };

    return await this.enqueuePlayer(payload);
  }

  async queueDevMatchmaking(input: DevJoinMatchmakingDto): Promise<{ jobId: string }> {
    if (process.env.NODE_ENV === "production") {
      throw new NotFoundException("Dev matchmaking endpoint is unavailable in production.");
    }

    const payload: QueuedPlayer = {
      userId: input.userId,
      username: input.username,
      region: input.region,
      elo: input.elo,
      mode: input.mode,
      queuedAt: new Date().toISOString(),
    };

    return await this.enqueuePlayer(payload);
  }

  private async enqueuePlayer(payload: QueuedPlayer): Promise<{ jobId: string }> {
    const job = await this.events.pushMatchmaking(payload);

    if (!job.id) throw new InternalServerErrorException("Queue player failed.");

    return { jobId: job.id };
  }
}
