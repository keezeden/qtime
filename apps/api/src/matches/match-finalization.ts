import { ConflictException } from '@nestjs/common';
import { MatchResult, MatchStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import {
  calculateTwoPlayerEloUpdates,
  type EloPlayerResult,
  type EloRatingUpdate,
} from '../ratings/elo';

const ELO_K_FACTOR = 32;
const RATING_ALGORITHM = 'elo-v1';

type ParticipantRating = {
  userId: number;
  user: {
    rating: number;
  };
};

type FinishedMatchData = {
  winnerUserId: number;
  participants: [ParticipantRating, ParticipantRating];
};

export async function finishMatch(
  transaction: Prisma.TransactionClient,
  matchId: number,
  nextState: Prisma.InputJsonObject,
): Promise<void> {
  const winnerUserId = readWinnerUserId(nextState);
  const participants = await transaction.matchParticipant.findMany({
    where: { matchId },
    select: {
      userId: true,
      user: {
        select: { rating: true },
      },
    },
    orderBy: { userId: 'asc' },
  });

  const finishedMatch = createFinishedMatchData(winnerUserId, participants);

  await transaction.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.FINISHED,
      finishedAt: new Date(),
    },
    select: { id: true },
  });

  await Promise.all([
    ...finishedMatch.participants.map((participant) =>
      updateParticipantResult(transaction, matchId, participant, finishedMatch.winnerUserId),
    ),
    ...calculateRatingUpdates(finishedMatch.participants, finishedMatch.winnerUserId).flatMap((rating) => [
      updateUserRating(transaction, rating),
      createRatingHistory(transaction, matchId, rating),
    ]),
  ]);
}

function readWinnerUserId(nextState: Prisma.InputJsonObject): number | null {
  const winnerUserId = nextState.winnerUserId;

  return typeof winnerUserId === 'number' && Number.isInteger(winnerUserId) ? winnerUserId : null;
}

function createFinishedMatchData(
  winnerUserId: number | null,
  participants: ParticipantRating[],
): FinishedMatchData {
  const firstParticipant = participants[0];
  const secondParticipant = participants[1];

  if (participants.length !== 2 || !firstParticipant || !secondParticipant) {
    throw new ConflictException('match_finished events require exactly two match participants.');
  }

  if (!winnerUserId || !participants.some((participant) => participant.userId === winnerUserId)) {
    throw new ConflictException('match_finished events must include a participant winnerUserId.');
  }

  return {
    winnerUserId,
    participants: [firstParticipant, secondParticipant],
  };
}

async function updateParticipantResult(
  transaction: Prisma.TransactionClient,
  matchId: number,
  participant: ParticipantRating,
  winnerUserId: number,
): Promise<void> {
  await transaction.matchParticipant.update({
    where: {
      matchId_userId: {
        matchId,
        userId: participant.userId,
      },
    },
    data: {
      result: participant.userId === winnerUserId ? MatchResult.WIN : MatchResult.LOSS,
    },
    select: { matchId: true, userId: true },
  });
}

function calculateRatingUpdates(
  participants: [ParticipantRating, ParticipantRating],
  winnerUserId: number,
): [EloRatingUpdate, EloRatingUpdate] {
  const playerResults: [EloPlayerResult, EloPlayerResult] = [
    toEloPlayerResult(participants[0], winnerUserId),
    toEloPlayerResult(participants[1], winnerUserId),
  ];

  return calculateTwoPlayerEloUpdates(playerResults, ELO_K_FACTOR);
}

function toEloPlayerResult(participant: ParticipantRating, winnerUserId: number): EloPlayerResult {
  return {
    userId: participant.userId,
    rating: participant.user.rating,
    score: participant.userId === winnerUserId ? 1 : 0,
  };
}

async function updateUserRating(
  transaction: Prisma.TransactionClient,
  rating: EloRatingUpdate,
): Promise<void> {
  await transaction.user.update({
    where: { id: rating.userId },
    data: { rating: rating.newRating },
    select: { id: true },
  });
}

async function createRatingHistory(
  transaction: Prisma.TransactionClient,
  matchId: number,
  rating: EloRatingUpdate,
): Promise<void> {
  await transaction.ratingHistory.create({
    data: {
      matchId,
      userId: rating.userId,
      oldRating: rating.oldRating,
      newRating: rating.newRating,
      delta: rating.delta,
      algorithm: RATING_ALGORITHM,
    },
    select: { id: true },
  });
}
