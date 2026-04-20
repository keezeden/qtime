import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { MATCHMAKING_QUEUE_NAME } from "@qtime/types";
import { BULL_BOARD_ENABLED } from "./queue.constants";

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
    ...(BULL_BOARD_ENABLED
      ? [
          BullBoardModule.forFeature({
            name: MATCHMAKING_QUEUE_NAME,
            adapter: BullMQAdapter,
          }),
        ]
      : []),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
