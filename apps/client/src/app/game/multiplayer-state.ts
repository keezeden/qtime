import type { GameEventType, MatchSummary } from "./multiplayer-api";
import {
  DEFAULT_TARGET_SCORE,
  type GameState,
  type PlayerId,
  createGame,
} from "./word-game";

export function createNamedGame(match: MatchSummary): GameState {
  const game = createGame(DEFAULT_TARGET_SCORE);
  const names = Object.fromEntries(
    match.matchParticipants.map((participant) => [
      participant.seat,
      participant.usernameSnapshot,
    ]),
  );

  return {
    ...game,
    players: {
      "player-one": {
        ...game.players["player-one"],
        name: names[0] ?? "Player One",
      },
      "player-two": {
        ...game.players["player-two"],
        name: names[1] ?? "Player Two",
      },
    },
  };
}

export function getLocalPlayerId(
  match: MatchSummary | null,
  userId: number,
): PlayerId | null {
  const participant = match?.matchParticipants.find((item) => item.userId === userId);
  if (!participant) return null;
  return participant.seat === 0 ? "player-one" : "player-two";
}

export function getUserIdForPlayerId(
  match: MatchSummary,
  playerId: PlayerId,
): number | null {
  const seat = playerId === "player-one" ? 0 : 1;
  const participant = match.matchParticipants.find((item) => item.seat === seat);

  return participant?.userId ?? null;
}

export type WordEventSubmission = {
  type: GameEventType;
  payload: Record<string, unknown>;
};

export function createWordEventSubmission(
  match: MatchSummary,
  state: GameState,
): WordEventSubmission {
  const playedWord = state.playedWords[0];

  if (state.status !== "finished") {
    return {
      type: "word_submitted",
      payload: { playedWord },
    };
  }

  return {
    type: "match_finished",
    payload: {
      playedWord,
      winnerUserId: state.winnerId ? getUserIdForPlayerId(match, state.winnerId) : null,
    },
  };
}
