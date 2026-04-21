import { IsString, MinLength } from 'class-validator';

export class LeaveMatchmakingDto {
  @IsString()
  @MinLength(1)
  jobId: string;
}
