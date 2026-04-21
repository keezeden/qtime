import type { MatchResult, MatchStatus } from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';
import type { GameEventType } from '../game-event-types';

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

export type GameEventResponse = {
  id: number;
  matchId: number;
  version: number;
  userId: number;
  type: GameEventType;
  payload: Prisma.JsonValue;
  createdAt: string;
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

export type GameEventAcceptedResponse = {
  event: GameEventResponse;
  state: GameStateResponse;
};

export type GameEventsResponse = {
  events: GameEventResponse[];
};

export type MatchHistoryItemResponse = {
  id: number;
  opponentName: string;
  result: MatchResult | null;
  ratingDelta: number | null;
  oldRating: number | null;
  newRating: number | null;
  finishedAt: string | null;
  finalScore: number | null;
  opponentScore: number | null;
};

export type MatchHistorySummaryResponse = {
  rating: number;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number | null;
};

export type MatchHistoryResponse = {
  summary: MatchHistorySummaryResponse;
  matches: MatchHistoryItemResponse[];
};
