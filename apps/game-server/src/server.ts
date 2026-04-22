import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { WebSocketServer } from "ws";
import { z } from "zod";
import {
  attachConnection,
  closeGameRoomPersistence,
  createGameRoom,
  type GameParticipant,
  type GameRoom,
} from "./game-room";

const port = Number.parseInt(process.env.GAME_SERVER_PORT ?? "3002", 10);
const rooms = new Map<number, GameRoom>();

const gameParticipantSchema = z.object({
  userId: z.number().int(),
  seat: z.number().int(),
  username: z.string(),
});

const createGameRequestSchema = z.object({
  matchId: z.number().int(),
  targetScore: z.number().int().positive(),
  participants: z.tuple([gameParticipantSchema, gameParticipantSchema]),
});

type CreateGameRequest = {
  matchId: number;
  targetScore: number;
  participants: [GameParticipant, GameParticipant];
};

const server = createServer((request, response) => {
  void handleHttpRequest(request, response);
});
const webSocketServer = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const match = /^\/games\/(\d+)\/connect$/.exec(url.pathname);

  if (!match) {
    socket.destroy();
    return;
  }

  const matchId = Number.parseInt(match[1], 10);
  const room = rooms.get(matchId);

  if (!room) {
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (connection) => {
    attachConnection(room, connection);
  });
});

server.listen(port, () => {
  console.log("Game server listening", { port });
});

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

async function handleHttpRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/games") {
    const body = await readJsonBody(request);
    const input = createGameRequestSchema.safeParse(body);

    if (!input.success) {
      writeJson(response, 400, {
        error: "Create game request was invalid.",
        details: input.error.flatten(),
      });
      return;
    }

    const room = createOrReplaceRoom(input.data);
    writeJson(response, 201, {
      matchId: room.matchId,
      websocketPath: `/games/${room.matchId}/connect`,
      version: 0,
    });
    return;
  }

  writeJson(response, 404, { error: "Route was not found." });
}

function createOrReplaceRoom(input: CreateGameRequest): GameRoom {
  const room = createGameRoom(input.matchId, input.targetScore, input.participants);
  rooms.set(input.matchId, room);
  return room;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log("Received shutdown signal", { signal });
  server.close();
  webSocketServer.close();
  await closeGameRoomPersistence();
}
