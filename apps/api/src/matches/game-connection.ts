import { z } from 'zod';
import type { Prisma } from '../generated/prisma/client';

export type GameConnectionResponse = {
  httpUrl: string;
  websocketPath: string;
  websocketUrl: string;
  version: number;
};

const gameConnectionSchema = z.object({
  httpUrl: z.string(),
  websocketPath: z.string(),
  websocketUrl: z.string(),
  version: z.number(),
});

const gameConnectionStateSchema = z.object({
  gameServer: gameConnectionSchema,
});

const recordSchema = z.record(z.string(), z.unknown());

export function readGameConnection(state: Prisma.JsonValue): GameConnectionResponse | null {
  const result = gameConnectionStateSchema.safeParse(state);
  return result.success ? result.data.gameServer : null;
}

export function preserveGameConnectionState(
  currentState: Prisma.JsonValue,
  nextState: Prisma.InputJsonObject,
): Prisma.InputJsonObject {
  const result = recordSchema.safeParse(currentState);
  if (!result.success) return nextState;

  const gameServer = recordSchema.safeParse(result.data.gameServer);
  if (!gameServer.success) return nextState;

  return {
    ...nextState,
    gameServer: gameServer.data as Prisma.InputJsonObject,
  };
}
