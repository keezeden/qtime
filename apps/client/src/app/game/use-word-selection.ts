"use client";

import { useCallback, useMemo, useState } from "react";
import { scoreWord, type Tile } from "@qtime/game";
import { VISIBLE_WORD_SLOTS } from "./word-duel-constants";

type WordSelectionOptions = {
  enabled: boolean;
  rack: Tile[];
  playerName: string;
  onMessage: (message: string) => void;
};

export type WordSelection = {
  addLetter: (letter: string) => void;
  addTile: (tile: Tile) => void;
  clear: () => void;
  previewScore: ReturnType<typeof scoreWord>;
  removeLast: () => void;
  selectedTileIds: Set<string>;
  selectedTiles: Tile[];
  wordEntry: string;
};

export function useWordSelection(options: WordSelectionOptions): WordSelection {
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const selectedTileIds = useMemo(() => new Set(selectedTiles.map((tile) => tile.id)), [selectedTiles]);
  const wordEntry = useMemo(() => selectedTiles.map((tile) => tile.letter).join(""), [selectedTiles]);
  const previewScore = useMemo(() => scoreWord(wordEntry), [wordEntry]);

  const clear = useCallback((): void => setSelectedTiles([]), []);

  const { enabled, onMessage, playerName, rack } = options;

  const addTile = useCallback((tile: Tile): void => {
    if (!enabled) return;

    setSelectedTiles((currentTiles) => {
      if (currentTiles.length >= VISIBLE_WORD_SLOTS) return currentTiles;
      if (currentTiles.some((selectedTile) => selectedTile.id === tile.id)) return currentTiles;
      return [...currentTiles, tile];
    });
  }, [enabled]);

  const addLetter = useCallback((letter: string): void => {
    if (!enabled) return;

    const normalizedLetter = letter.toUpperCase();

    setSelectedTiles((currentTiles) => {
      if (currentTiles.length >= VISIBLE_WORD_SLOTS) return currentTiles;

      const currentIds = new Set(currentTiles.map((tile) => tile.id));
      const nextTile = rack.find(
        (tile) => tile.letter === normalizedLetter && !currentIds.has(tile.id),
      );

      if (!nextTile) {
        onMessage(`${playerName} has no ${normalizedLetter} tile left.`);
        return currentTiles;
      }

      return [...currentTiles, nextTile];
    });
  }, [enabled, onMessage, playerName, rack]);

  const removeLast = useCallback((): void => {
    setSelectedTiles((currentTiles) => currentTiles.slice(0, -1));
  }, []);

  return {
    addLetter,
    addTile,
    clear,
    previewScore,
    removeLast,
    selectedTileIds,
    selectedTiles,
    wordEntry,
  };
}
