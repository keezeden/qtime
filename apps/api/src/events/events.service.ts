import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, JobsOptions, Job } from "bullmq";

@Injectable()
export class EventsService {
  constructor(@InjectQueue("events") private readonly queue: Queue) {}

  async push<T>(type: string, payload: T, options?: JobsOptions): Promise<Job> {
    return await this.queue.add(type, payload, options);
  }
}
