import { Type } from 'class-transformer';
import { IsInt, IsObject, IsString, Min, MinLength } from 'class-validator';
import type { Prisma } from '../../generated/prisma/client';

export class CreateGameEventDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  baseVersion: number;

  @IsString()
  @MinLength(1)
  type: string;

  @IsObject()
  payload: Prisma.InputJsonObject;

  @IsString()
  @MinLength(1)
  stateStatus: string;

  @IsObject()
  nextState: Prisma.InputJsonObject;
}
