import type { Tile } from "./word-game-types";

export const tileValues: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const tileDistribution: Record<string, number> = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};

export type DrawTilesResult = {
  drawn: Tile[];
  bag: Tile[];
};

export function createTileBag(): Tile[] {
  return Object.entries(tileDistribution).flatMap(([letter, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${letter}-${index}-${createId("tile")}`,
      letter,
      value: tileValues[letter],
    })),
  );
}

export function drawTiles(bag: Tile[], count: number): DrawTilesResult {
  return {
    drawn: bag.slice(0, count),
    bag: bag.slice(count),
  };
}

export function removeWordTiles(rack: Tile[], word: string): Tile[] {
  const remainingRack = [...rack];

  for (const letter of word) {
    const tileIndex = remainingRack.findIndex((tile) => tile.letter === letter);
    if (tileIndex >= 0) {
      remainingRack.splice(tileIndex, 1);
    }
  }

  return remainingRack;
}

export function shuffleTiles(tiles: Tile[]): Tile[] {
  const shuffled = [...tiles];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
