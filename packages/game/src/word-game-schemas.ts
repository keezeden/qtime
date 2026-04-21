import { z } from "zod";

export const playerIdSchema = z.enum(["player-one", "player-two"]);

export const tileSchema = z.object({
  id: z.string(),
  letter: z.string(),
  value: z.number(),
});

export const playerStateSchema = z.object({
  id: playerIdSchema,
  name: z.string(),
  score: z.number(),
  rack: z.array(tileSchema),
});

export const playedWordSchema = z.object({
  id: z.string(),
  playerId: playerIdSchema,
  playerName: z.string(),
  word: z.string(),
  baseScore: z.number(),
  bonusScore: z.number(),
  totalScore: z.number(),
  turnNumber: z.number(),
});

const scoresSchema = z.record(playerIdSchema, z.number());

export const matchEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("match_started"),
    targetScore: z.number(),
    players: z.array(z.string()),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("word_submitted"),
    playedWord: playedWordSchema,
    scores: scoresSchema,
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("rack_refreshed"),
    playerId: playerIdSchema,
    playerName: z.string(),
    turnNumber: z.number(),
    timestamp: z.string(),
  }),
  z.object({
    type: z.literal("match_finished"),
    winnerId: playerIdSchema,
    winnerName: z.string(),
    finalScores: scoresSchema,
    playedWords: z.array(playedWordSchema),
    timestamp: z.string(),
  }),
]);

export const gameStateSchema = z.object({
  id: z.string(),
  targetScore: z.number(),
  players: z.record(playerIdSchema, playerStateSchema),
  currentPlayerId: playerIdSchema,
  tileBag: z.array(tileSchema),
  playedWords: z.array(playedWordSchema),
  eventLog: z.array(matchEventSchema),
  status: z.enum(["playing", "finished"]),
  winnerId: playerIdSchema.nullable(),
  turnNumber: z.number(),
});
