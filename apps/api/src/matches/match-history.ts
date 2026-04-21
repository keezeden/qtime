import { MatchResult } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import type {
  MatchHistoryItemResponse,
  MatchHistorySummaryResponse,
} from './types/match-response';

export const historyMatchSelect = {
  id: true,
  finishedAt: true,
  gameState: {
    select: { state: true },
  },
  matchParticipants: {
    select: {
      userId: true,
      seat: true,
      usernameSnapshot: true,
      result: true,
    },
    orderBy: { seat: 'asc' },
  },
  ratingHistory: {
    select: {
      userId: true,
      oldRating: true,
      newRating: true,
      delta: true,
    },
  },
} as const;

type HistoryMatchRecord = Prisma.MatchGetPayload<{ select: typeof historyMatchSelect }>;

export function createHistorySummary(
  rating: number,
  matches: MatchHistoryItemResponse[],
): MatchHistorySummaryResponse {
  const wins = matches.filter((match) => match.result === MatchResult.WIN).length;
  const losses = matches.filter((match) => match.result === MatchResult.LOSS).length;
  const totalMatches = matches.length;

  return {
    rating,
    wins,
    losses,
    totalMatches,
    winRate: totalMatches ? Math.round((wins / totalMatches) * 100) : null,
  };
}

export function serializeHistoryMatch(match: HistoryMatchRecord, userId: number): MatchHistoryItemResponse {
  const player = match.matchParticipants.find((participant) => participant.userId === userId);
  const opponent = match.matchParticipants.find((participant) => participant.userId !== userId);
  const rating = match.ratingHistory.find((item) => item.userId === userId);
  const scores = readFinalScores(match.gameState?.state);

  return {
    id: match.id,
    opponentName: opponent?.usernameSnapshot ?? 'Opponent',
    result: player?.result ?? null,
    ratingDelta: rating?.delta ?? null,
    oldRating: rating?.oldRating ?? null,
    newRating: rating?.newRating ?? null,
    finishedAt: match.finishedAt ? match.finishedAt.toISOString() : null,
    finalScore: player && scores ? scores[player.seat] ?? null : null,
    opponentScore: opponent && scores ? scores[opponent.seat] ?? null : null,
  };
}

function readFinalScores(state: Prisma.JsonValue | undefined): Record<number, number | null> | null {
  if (!isRecord(state) || !isRecord(state.players)) return null;

  return {
    0: readPlayerScore(state.players['player-one']),
    1: readPlayerScore(state.players['player-two']),
  };
}

function readPlayerScore(player: unknown): number | null {
  return isRecord(player) && typeof player.score === 'number' ? player.score : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
