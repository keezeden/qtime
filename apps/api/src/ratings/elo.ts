export type EloScore = 0 | 0.5 | 1;

export type EloPlayerResult = {
  userId: number;
  rating: number;
  score: EloScore;
};

export type EloRatingUpdate = {
  userId: number;
  oldRating: number;
  newRating: number;
  delta: number;
};

export function calculateExpectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

export function calculateEloRating(
  rating: number,
  expectedScore: number,
  score: EloScore,
  kFactor: number,
): number {
  return Math.round(rating + kFactor * (score - expectedScore));
}

export function calculateTwoPlayerEloUpdates(
  players: [EloPlayerResult, EloPlayerResult],
  kFactor: number,
): [EloRatingUpdate, EloRatingUpdate] {
  const [first, second] = players;
  const firstExpectedScore = calculateExpectedScore(first.rating, second.rating);
  const secondExpectedScore = calculateExpectedScore(second.rating, first.rating);
  const firstNewRating = calculateEloRating(first.rating, firstExpectedScore, first.score, kFactor);
  const secondNewRating = calculateEloRating(second.rating, secondExpectedScore, second.score, kFactor);

  return [
    {
      userId: first.userId,
      oldRating: first.rating,
      newRating: firstNewRating,
      delta: firstNewRating - first.rating,
    },
    {
      userId: second.userId,
      oldRating: second.rating,
      newRating: secondNewRating,
      delta: secondNewRating - second.rating,
    },
  ];
}
