import { DEFAULT_TARGET_SCORE } from "./word-game";

export const SCORE_TARGET_OPTIONS = [100, 250, DEFAULT_TARGET_SCORE, 750];
export const VISIBLE_WORD_SLOTS = 9;

export const RULES = [
  "One word per turn.",
  "Use only letters from your own rack.",
  "Draw back to fifteen tiles after scoring.",
  "Refresh your rack to pass when stuck.",
  "First player to the target score wins.",
];
