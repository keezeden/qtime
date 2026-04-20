import type { MatchSummary } from "./multiplayer-api";
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
