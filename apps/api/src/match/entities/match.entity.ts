import { MatchParticipant } from 'src/generated/prisma/client';
import { Team } from 'src/generated/prisma/enums';

export class Match {
  matchId: number;
  participants: MatchParticipant[];
  winner: Team;
}
