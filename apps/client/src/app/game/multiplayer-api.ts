import type { GameState } from "./word-game";

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

export async function joinMatchmaking(): Promise<void> {
  await apiFetch("/api/matchmaking", {
    method: "POST",
    body: JSON.stringify({ region: "oce", mode: "word-duel" }),
  });
}

export async function fetchCurrentMatch(): Promise<MatchSummary | null> {
  const body = await apiFetch<CurrentMatchResponse>("/api/matches/current", {
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
  if (!isRecord(event.payload)) {
    return null;
  }

  const nextState = event.payload.nextState;
  return isGameState(nextState) ? nextState : null;
}

export function isGameState(value: unknown): value is GameState {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.targetScore === "number" &&
    isRecord(value.players) &&
    value.currentPlayerId !== undefined &&
    Array.isArray(value.tileBag) &&
    Array.isArray(value.playedWords) &&
    Array.isArray(value.eventLog)
  );
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
