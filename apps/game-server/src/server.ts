import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";
import { createGame, type GameState } from "@qtime/game";
import { z } from "zod";

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

const socketMessageSchema = z.object({
  type: z.string(),
});

type GameParticipant = z.infer<typeof gameParticipantSchema>;
type CreateGameRequest = z.infer<typeof createGameRequestSchema>;

type GameRoom = {
  matchId: number;
  state: GameState;
  connections: Set<WebSocket>;
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
  const state = createNamedGame(input.targetScore, input.participants);
  const room: GameRoom = {
    matchId: input.matchId,
    state,
    connections: new Set(),
  };

  rooms.set(input.matchId, room);
  return room;
}

function createNamedGame(targetScore: number, participants: [GameParticipant, GameParticipant]): GameState {
  const game = createGame(targetScore);
  const names = Object.fromEntries(participants.map((participant) => [participant.seat, participant.username]));

  return {
    ...game,
    players: {
      "player-one": { ...game.players["player-one"], name: names[0] ?? "Player One" },
      "player-two": { ...game.players["player-two"], name: names[1] ?? "Player Two" },
    },
  };
}

function attachConnection(room: GameRoom, connection: WebSocket): void {
  room.connections.add(connection);
  sendJson(connection, { type: "snapshot", matchId: room.matchId, state: room.state, version: 0 });

  connection.on("message", (message) => {
    const input = parseSocketMessage(message.toString());
    if (input?.type === "ping") sendJson(connection, { type: "pong" });
  });
  connection.on("close", () => {
    room.connections.delete(connection);
  });
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function parseSocketMessage(message: string): { type: string } | null {
  try {
    const input = JSON.parse(message) as unknown;
    const result = socketMessageSchema.safeParse(input);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function sendJson(connection: WebSocket, body: unknown): void {
  connection.send(JSON.stringify(body));
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}
