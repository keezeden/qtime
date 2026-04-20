import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsString, Min, MinLength } from 'class-validator';
import type { Prisma } from '../../generated/prisma/client';
import { GAME_EVENT_TYPES, type GameEventType } from '../game-event-types';

export class CreateGameEventDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  baseVersion: number;

  @IsIn(GAME_EVENT_TYPES)
  type: GameEventType;

  @IsObject()
  payload: Prisma.InputJsonObject;

  @IsString()
  @MinLength(1)
  stateStatus: string;

  @IsObject()
  nextState: Prisma.InputJsonObject;
}
