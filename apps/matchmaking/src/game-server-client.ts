import type { MatchmakingPair } from "@qtime/types";

const JSON_CONTENT_TYPE = "application/json";

export type GameServerParticipant = {
  userId: number;
  seat: number;
  username: string;
};

export type CreateGameRequest = {
  matchId: number;
  targetScore: number;
  participants: [GameServerParticipant, GameServerParticipant];
};

export type CreateGameResponse = {
  matchId: number;
  websocketPath: string;
  version: number;
};

export type GameServerClientConfig = {
  baseUrl: string;
  maxAttempts: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
};

export type GameServerErrorDetails = {
  url: string;
  method: string;
  statusCode?: number;
  responseBody?: string;
  requestBody?: CreateGameRequest;
  errorMessage?: string;
};

export class GameServerRequestError extends Error {
  readonly details: GameServerErrorDetails;

  constructor(message: string, details: GameServerErrorDetails) {
    super(message);
    this.name = "GameServerRequestError";
    this.details = details;
  }
}

export const createGameInitializationRequest = (
  matchId: number,
  pair: MatchmakingPair,
  targetScore: number,
): CreateGameRequest => ({
  matchId,
  targetScore,
  participants: [
    {
      userId: pair.players[0].userId,
      seat: 0,
      username: pair.players[0].username,
    },
    {
      userId: pair.players[1].userId,
      seat: 1,
      username: pair.players[1].username,
    },
  ],
});

export class GameServerClient {
  private readonly config: GameServerClientConfig;

  constructor(config: GameServerClientConfig) {
    this.config = config;
  }

  async createGame(request: CreateGameRequest): Promise<CreateGameResponse> {
    let lastError: GameServerRequestError | null = null;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt += 1) {
      try {
        return await this.createGameOnce(request);
      } catch (error) {
        const requestError = toGameServerRequestError(error);
        lastError = requestError;

        console.warn("Game server initialization attempt failed", {
          attempt,
          maxAttempts: this.config.maxAttempts,
          matchId: request.matchId,
          details: requestError.details,
        });

        if (attempt < this.config.maxAttempts) {
          await delay(this.config.retryDelayMs);
        }
      }
    }

    if (lastError) throw lastError;
    throw new Error("Game server initialization exhausted attempts without returning a result.");
  }

  private async createGameOnce(request: CreateGameRequest): Promise<CreateGameResponse> {
    const url = new URL("/games", this.config.baseUrl).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
    const requestBody = JSON.stringify(request);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": JSON_CONTENT_TYPE },
        body: requestBody,
        signal: controller.signal,
      });
      const responseBody = await response.text();

      if (!response.ok) {
        throw new GameServerRequestError("Game server returned an unsuccessful response.", {
          url,
          method: "POST",
          statusCode: response.status,
          responseBody,
          requestBody: request,
        });
      }

      return parseCreateGameResponse(url, responseBody);
    } catch (error) {
      if (error instanceof GameServerRequestError) throw error;

      throw new GameServerRequestError("Game server request failed.", {
        url,
        method: "POST",
        requestBody: request,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

const parseCreateGameResponse = (url: string, responseBody: string): CreateGameResponse => {
  let value: unknown;

  try {
    value = JSON.parse(responseBody) as unknown;
  } catch (error) {
    throw new GameServerRequestError("Game server returned invalid JSON.", {
      url,
      method: "POST",
      responseBody,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }

  if (!isCreateGameResponse(value)) {
    throw new GameServerRequestError("Game server returned an invalid create-game response.", {
      url,
      method: "POST",
      responseBody,
    });
  }

  return value;
};

const isCreateGameResponse = (value: unknown): value is CreateGameResponse =>
  typeof value === "object" &&
  value !== null &&
  "matchId" in value &&
  typeof value.matchId === "number" &&
  "websocketPath" in value &&
  typeof value.websocketPath === "string" &&
  "version" in value &&
  typeof value.version === "number";

const toGameServerRequestError = (error: unknown): GameServerRequestError => {
  if (error instanceof GameServerRequestError) return error;

  return new GameServerRequestError("Game server request failed.", {
    url: "unknown",
    method: "POST",
    errorMessage: error instanceof Error ? error.message : String(error),
  });
};

const delay = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
