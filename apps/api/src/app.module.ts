import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { MatchModule } from './match/match.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, MatchModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
