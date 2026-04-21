import { IsISO8601, IsOptional } from 'class-validator';

export class FindCurrentMatchDto {
  @IsOptional()
  @IsISO8601()
  startedAfter?: string;
}
