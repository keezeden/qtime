import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PrismaService } from "./prisma/prisma.service";
import { EventsModule } from "./events/events.module";
import { MatchmakingModule } from "./matchmaking/matchmaking.module";
import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    UserModule,
    EventsModule,
    MatchmakingModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
