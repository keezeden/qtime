import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, JobsOptions, Job } from "bullmq";
import { MATCHMAKING_QUEUE_NAME } from "@qtime/types";
import type { QueuedPlayer } from "@qtime/types";
import { MATCHMAKING_QUEUED_JOB_NAME } from "./queue.constants";

@Injectable()
export class EventsService {
  constructor(@InjectQueue(MATCHMAKING_QUEUE_NAME) private readonly matchmakingQueue: Queue) {}

  async pushMatchmaking(payload: QueuedPlayer, options?: JobsOptions): Promise<Job<QueuedPlayer>> {
    return await this.matchmakingQueue.add(MATCHMAKING_QUEUED_JOB_NAME, payload, options);
  }

  async removeMatchmakingJob(jobId: string, userId: number): Promise<boolean> {
    const job = await this.matchmakingQueue.getJob(jobId);

    if (!job) return false;
    if (job.data.userId !== userId) return false;

    const state = await job.getState();

    if (state === 'active') return false;

    await job.remove();
    return true;
  }
}
