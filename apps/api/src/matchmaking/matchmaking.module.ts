import { Module } from "@nestjs/common";
import { MatchmakingService } from "./matchmaking.service";
import { MatchmakingController } from "./matchmaking.controller";
import { EventsModule } from "src/events/events.module";

@Module({
  imports: [EventsModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
})
export class MatchmakingModule {}
