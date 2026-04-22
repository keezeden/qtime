import { gameStateSchema, type GameState } from "@qtime/game";
import { z } from "zod";

export type GameEventType =
  | "game_initialized"
  | "word_submitted"
  | "rack_refreshed"
  | "rack_shuffled"
  | "match_finished";

export type MatchParticipant = {
  userId: number;
  seat: number;
  usernameSnapshot: string;
  eloSnapshot: number;
  result: string | null;
};

export type MatchSummary = {
  id: number;
  mode: string;
  region: string;
  status: string;
  matchParticipants: MatchParticipant[];
};

export type GameStateEnvelope = {
  matchId: number;
  version: number;
  status: string;
  state: unknown;
  gameConnection: {
    httpUrl: string;
    websocketPath: string;
    websocketUrl: string;
    version: number;
  } | null;
  updatedAt: string;
};

export type GameEvent = {
  id: number;
  matchId: number;
  version: number;
  userId: number;
  type: GameEventType;
  payload: unknown;
  createdAt: string;
};

export type MatchHistoryItem = {
  id: number;
  opponentName: string;
  result: string | null;
  ratingDelta: number | null;
  oldRating: number | null;
  newRating: number | null;
  finishedAt: string | null;
  finalScore: number | null;
  opponentScore: number | null;
};

export type MatchHistoryResponse = {
  summary: {
    rating: number;
    wins: number;
    losses: number;
    totalMatches: number;
    winRate: number | null;
  };
  matches: MatchHistoryItem[];
};

type CurrentMatchResponse = {
  match: MatchSummary | null;
};

type MatchStateResponse = {
  state: GameStateEnvelope;
};

type GameEventsResponse = {
  events: GameEvent[];
};

type GameEventAcceptedResponse = {
  event: GameEvent;
  state: GameStateEnvelope;
};

type JoinMatchmakingResponse = {
  jobId: string;
};

export async function joinMatchmaking(): Promise<JoinMatchmakingResponse> {
  return await apiFetch<JoinMatchmakingResponse>("/api/matchmaking", {
    method: "POST",
    body: JSON.stringify({ region: "oce", mode: "word-duel" }),
  });
}

export async function leaveMatchmaking(jobId: string): Promise<void> {
  await apiFetch("/api/matchmaking", {
    method: "DELETE",
    body: JSON.stringify({ jobId }),
    keepalive: true,
  });
}

export async function fetchCurrentMatch(startedAfter: string | null): Promise<MatchSummary | null> {
  const query = startedAfter ? `?startedAfter=${encodeURIComponent(startedAfter)}` : "";
  const body = await apiFetch<CurrentMatchResponse>(`/api/matches/current${query}`, {
    method: "GET",
  });
  return body.match;
}

export async function fetchMatchState(matchId: number): Promise<GameStateEnvelope> {
  const body = await apiFetch<MatchStateResponse>(`/api/matches/${matchId}/state`, {
    method: "GET",
  });
  return body.state;
}

export async function fetchGameEvents(
  matchId: number,
  afterVersion: number,
): Promise<GameEvent[]> {
  const body = await apiFetch<GameEventsResponse>(
    `/api/matches/${matchId}/events?afterVersion=${afterVersion}`,
    { method: "GET" },
  );
  return body.events;
}

export async function fetchMatchHistory(): Promise<MatchHistoryResponse> {
  return await apiFetch<MatchHistoryResponse>("/api/matches/history", {
    method: "GET",
  });
}

export async function submitGameState(
  matchId: number,
  baseVersion: number,
  type: GameEventType,
  payload: Record<string, unknown>,
  nextState: GameState,
): Promise<GameStateEnvelope> {
  const body = await apiFetch<GameEventAcceptedResponse>(
    `/api/matches/${matchId}/events`,
    {
      method: "POST",
      body: JSON.stringify({
        baseVersion,
        type,
        payload: { ...payload, nextState },
        stateStatus: nextState.status === "finished" ? "finished" : "active",
        nextState: {
          ...nextState,
          winnerUserId: payload.winnerUserId,
        },
      }),
    },
  );
  return body.state;
}

export function readEventState(event: GameEvent): GameState | null {
  const result = gameEventPayloadSchema.safeParse(event.payload);
  return result.success ? result.data.nextState : null;
}

export function isGameState(value: unknown): value is GameState {
  return gameStateSchema.safeParse(value).success;
}

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed: ${response.status} ${body}`);
  }

  return (await response.json()) as T;
}

const gameEventPayloadSchema = z.object({
  nextState: gameStateSchema,
});
