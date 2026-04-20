import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListGameEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  afterVersion?: number;
}
