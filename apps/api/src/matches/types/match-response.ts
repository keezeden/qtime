import type { MatchResult, MatchStatus } from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';

export type MatchParticipantResponse = {
  userId: number;
  seat: number;
  usernameSnapshot: string;
  eloSnapshot: number;
  result: MatchResult | null;
};

export type MatchSummaryResponse = {
  id: number;
  mode: string;
  region: string;
  status: MatchStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  matchParticipants: MatchParticipantResponse[];
};

export type GameStateResponse = {
  matchId: number;
  version: number;
  status: string;
  state: Prisma.JsonValue;
  updatedAt: string;
};

export type CurrentMatchResponse = {
  match: MatchSummaryResponse | null;
};

export type MatchResponse = {
  match: MatchSummaryResponse;
};

export type MatchStateResponse = {
  state: GameStateResponse;
};
