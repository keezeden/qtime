import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, JobsOptions, Job } from "bullmq";

@Injectable()
export class EventsService {
  constructor(@InjectQueue("matchmaking") private readonly matchmakingQueue: Queue) {}

  async pushMatchmaking<T>(type: string, payload: T, options?: JobsOptions): Promise<Job> {
    return await this.matchmakingQueue.add(type, payload, options);
  }
}
