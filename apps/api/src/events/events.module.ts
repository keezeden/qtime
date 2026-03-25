import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: "events",
    }),
    BullBoardModule.forFeature({
      name: "events",
      adapter: BullMQAdapter,
    }),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
