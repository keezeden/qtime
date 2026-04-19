import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

export const MATCHMAKING_QUEUE_NAME = process.env.MATCHMAKING_QUEUE_NAME ?? "matchmaking";

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: MATCHMAKING_QUEUE_NAME,
    }),
    BullBoardModule.forFeature({
      name: MATCHMAKING_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
