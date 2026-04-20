import { calculateExpectedScore, calculateTwoPlayerEloUpdates } from './elo';

describe('ELO rating calculations', () => {
  it('calculates an even expected score for equal ratings', () => {
    expect(calculateExpectedScore(1200, 1200)).toBe(0.5);
  });

  it('awards equal-rating winners the standard k-factor half delta', () => {
    expect(
      calculateTwoPlayerEloUpdates(
        [
          { userId: 1, rating: 1200, score: 1 },
          { userId: 2, rating: 1200, score: 0 },
        ],
        32,
      ),
    ).toEqual([
      { userId: 1, oldRating: 1200, newRating: 1216, delta: 16 },
      { userId: 2, oldRating: 1200, newRating: 1184, delta: -16 },
    ]);
  });

  it('gives an underdog winner a larger delta', () => {
    expect(
      calculateTwoPlayerEloUpdates(
        [
          { userId: 1, rating: 1000, score: 1 },
          { userId: 2, rating: 1400, score: 0 },
        ],
        32,
      ),
    ).toEqual([
      { userId: 1, oldRating: 1000, newRating: 1029, delta: 29 },
      { userId: 2, oldRating: 1400, newRating: 1371, delta: -29 },
    ]);
  });
});
