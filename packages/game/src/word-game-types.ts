export const RACK_SIZE = 15;
export const DEFAULT_TARGET_SCORE = 500;
export const MIN_WORD_LENGTH = 2;

export type PlayerId = "player-one" | "player-two";

export type Tile = {
  id: string;
  letter: string;
  value: number;
};

export type PlayerState = {
  id: PlayerId;
  name: string;
  score: number;
  rack: Tile[];
};

export type PlayedWord = {
  id: string;
  playerId: PlayerId;
  playerName: string;
  word: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  turnNumber: number;
};

export type MatchEvent =
  | {
      type: "match_started";
      targetScore: number;
      players: string[];
      timestamp: string;
    }
  | {
      type: "word_submitted";
      playedWord: PlayedWord;
      scores: Record<PlayerId, number>;
      timestamp: string;
    }
  | {
      type: "rack_refreshed";
      playerId: PlayerId;
      playerName: string;
      turnNumber: number;
      timestamp: string;
    }
  | {
      type: "match_finished";
      winnerId: PlayerId;
      winnerName: string;
      finalScores: Record<PlayerId, number>;
      playedWords: PlayedWord[];
      timestamp: string;
    };

export type GameState = {
  id: string;
  targetScore: number;
  players: Record<PlayerId, PlayerState>;
  currentPlayerId: PlayerId;
  tileBag: Tile[];
  playedWords: PlayedWord[];
  eventLog: MatchEvent[];
  status: "playing" | "finished";
  winnerId: PlayerId | null;
  turnNumber: number;
};

export type SubmitWordResult = {
  state: GameState;
  error?: string;
};

export type WordScore = {
  baseScore: number;
  bonusScore: number;
  totalScore: number;
};
