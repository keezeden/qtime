import { gameStateSchema, type GameState } from "@qtime/game";
import { z } from "zod";

export type GameSocketMessage =
  | {
      type: "snapshot";
      matchId: number;
      state: GameState;
      version: number;
    }
  | {
      type: "command_rejected";
      reason: string;
      currentVersion: number;
    }
  | {
      type: "pong";
    };

export type GameSocketCommand =
  | {
      type: "ping";
    }
  | {
      type: "refresh_rack";
      baseVersion: number;
    }
  | {
      type: "shuffle_rack";
      baseVersion: number;
    };

const gameSocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("snapshot"),
    matchId: z.number(),
    state: gameStateSchema,
    version: z.number(),
  }),
  z.object({
    type: z.literal("pong"),
  }),
  z.object({
    type: z.literal("command_rejected"),
    reason: z.string(),
    currentVersion: z.number(),
  }),
]);

export function readGameSocketMessage(value: string): GameSocketMessage | null {
  const input = parseJson(value);
  const result = gameSocketMessageSchema.safeParse(input);
  return result.success ? result.data : null;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
