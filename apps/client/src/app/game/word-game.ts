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

const tileValues: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const tileDistribution: Record<string, number> = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};

export function createGame(targetScore = DEFAULT_TARGET_SCORE): GameState {
  let bag = shuffleTiles(createTileBag());
  const playerOneRackResult = drawTiles(bag, RACK_SIZE);
  bag = playerOneRackResult.bag;
  const playerTwoRackResult = drawTiles(bag, RACK_SIZE);
  bag = playerTwoRackResult.bag;

  const startedEvent: MatchEvent = {
    type: "match_started",
    targetScore,
    players: ["Player One", "Player Two"],
    timestamp: new Date().toISOString(),
  };

  return {
    id: createId("match"),
    targetScore,
    players: {
      "player-one": {
        id: "player-one",
        name: "Player One",
        score: 0,
        rack: playerOneRackResult.drawn,
      },
      "player-two": {
        id: "player-two",
        name: "Player Two",
        score: 0,
        rack: playerTwoRackResult.drawn,
      },
    },
    currentPlayerId: "player-one",
    tileBag: bag,
    playedWords: [],
    eventLog: [startedEvent],
    status: "playing",
    winnerId: null,
    turnNumber: 1,
  };
}

export function submitWord(state: GameState, rawWord: string): SubmitWordResult {
  if (state.status === "finished") {
    return { state, error: "This match is already complete." };
  }

  const word = normalizeWord(rawWord);

  if (word.length < MIN_WORD_LENGTH) {
    return { state, error: `Words need at least ${MIN_WORD_LENGTH} letters.` };
  }

  if (!canBuildWord(state.players[state.currentPlayerId].rack, word)) {
    return {
      state,
      error: "That word uses letters outside the current rack.",
    };
  }

  const player = state.players[state.currentPlayerId];
  const score = scoreWord(word);
  const rackAfterWord = removeWordTiles(player.rack, word);
  const drawResult = drawTiles(state.tileBag, RACK_SIZE - rackAfterWord.length);
  const nextScore = player.score + score.totalScore;
  const playedWord: PlayedWord = {
    id: createId("word"),
    playerId: player.id,
    playerName: player.name,
    word,
    baseScore: score.baseScore,
    bonusScore: score.bonusScore,
    totalScore: score.totalScore,
    turnNumber: state.turnNumber,
  };
  const nextPlayers = {
    ...state.players,
    [player.id]: {
      ...player,
      score: nextScore,
      rack: [...rackAfterWord, ...drawResult.drawn],
    },
  };
  const nextPlayedWords = [playedWord, ...state.playedWords];
  const wordEvent: MatchEvent = {
    type: "word_submitted",
    playedWord,
    scores: {
      "player-one": nextPlayers["player-one"].score,
      "player-two": nextPlayers["player-two"].score,
    },
    timestamp: new Date().toISOString(),
  };
  const reachedTarget = nextScore >= state.targetScore;
  const finishEvent: MatchEvent | null = reachedTarget
    ? {
        type: "match_finished",
        winnerId: player.id,
        winnerName: player.name,
        finalScores: {
          "player-one": nextPlayers["player-one"].score,
          "player-two": nextPlayers["player-two"].score,
        },
        playedWords: nextPlayedWords,
        timestamp: new Date().toISOString(),
      }
    : null;

  return {
    state: {
      ...state,
      players: nextPlayers,
      tileBag: drawResult.bag,
      playedWords: nextPlayedWords,
      eventLog: finishEvent
        ? [...state.eventLog, wordEvent, finishEvent]
        : [...state.eventLog, wordEvent],
      currentPlayerId: reachedTarget ? player.id : getNextPlayerId(player.id),
      status: reachedTarget ? "finished" : "playing",
      winnerId: reachedTarget ? player.id : null,
      turnNumber: reachedTarget ? state.turnNumber : state.turnNumber + 1,
    },
  };
}

export function refreshRack(state: GameState): GameState {
  if (state.status === "finished") {
    return state;
  }

  const player = state.players[state.currentPlayerId];
  const reshuffledBag = shuffleTiles([...state.tileBag, ...player.rack]);
  const drawResult = drawTiles(reshuffledBag, RACK_SIZE);
  const nextPlayers = {
    ...state.players,
    [player.id]: {
      ...player,
      rack: drawResult.drawn,
    },
  };
  const event: MatchEvent = {
    type: "rack_refreshed",
    playerId: player.id,
    playerName: player.name,
    turnNumber: state.turnNumber,
    timestamp: new Date().toISOString(),
  };

  return {
    ...state,
    players: nextPlayers,
    tileBag: drawResult.bag,
    currentPlayerId: getNextPlayerId(player.id),
    turnNumber: state.turnNumber + 1,
    eventLog: [...state.eventLog, event],
  };
}

export function scoreWord(word: string) {
  const letters = normalizeWord(word).split("");
  const baseScore = letters.reduce(
    (score, letter) => score + (tileValues[letter] ?? 0),
    0,
  );
  const plusFiveLetters = Math.max(0, Math.min(letters.length, 7) - 4);
  const plusTenLetters = Math.max(0, letters.length - 7);
  const bonusScore = plusFiveLetters * 5 + plusTenLetters * 10;

  return {
    baseScore,
    bonusScore,
    totalScore: baseScore + bonusScore,
  };
}

export function canBuildWord(rack: Tile[], rawWord: string) {
  const rackCounts = countLetters(rack.map((tile) => tile.letter));
  const wordCounts = countLetters(normalizeWord(rawWord).split(""));

  return Object.entries(wordCounts).every(
    ([letter, count]) => (rackCounts[letter] ?? 0) >= count,
  );
}

export function getPlayableRackLetters(rack: Tile[]) {
  return rack.map((tile) => tile.letter).join("");
}

function createTileBag() {
  return Object.entries(tileDistribution).flatMap(([letter, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${letter}-${index}-${createId("tile")}`,
      letter,
      value: tileValues[letter],
    })),
  );
}

function drawTiles(bag: Tile[], count: number) {
  return {
    drawn: bag.slice(0, count),
    bag: bag.slice(count),
  };
}

function removeWordTiles(rack: Tile[], word: string) {
  const remainingRack = [...rack];

  for (const letter of word) {
    const tileIndex = remainingRack.findIndex((tile) => tile.letter === letter);
    if (tileIndex >= 0) {
      remainingRack.splice(tileIndex, 1);
    }
  }

  return remainingRack;
}

function normalizeWord(word: string) {
  return word.replace(/[^a-z]/gi, "").toUpperCase();
}

function getNextPlayerId(playerId: PlayerId): PlayerId {
  return playerId === "player-one" ? "player-two" : "player-one";
}

function countLetters(letters: string[]) {
  return letters.reduce<Record<string, number>>((counts, letter) => {
    counts[letter] = (counts[letter] ?? 0) + 1;
    return counts;
  }, {});
}

function shuffleTiles(tiles: Tile[]) {
  const shuffled = [...tiles];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
