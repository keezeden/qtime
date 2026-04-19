import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, JobsOptions, Job } from "bullmq";
import { MATCHMAKING_QUEUE_NAME } from "./events.module";

@Injectable()
export class EventsService {
  constructor(@InjectQueue(MATCHMAKING_QUEUE_NAME) private readonly matchmakingQueue: Queue) {}

  async pushMatchmaking<T>(type: string, payload: T, options?: JobsOptions): Promise<Job> {
    return await this.matchmakingQueue.add(type, payload, options);
  }
}
