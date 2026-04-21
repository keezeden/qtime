import {
  MIN_WORD_LENGTH,
  RACK_SIZE,
  type GameState,
  type MatchEvent,
  type PlayerId,
  type SubmitWordResult,
  type Tile,
  type WordScore,
} from "./word-game-types";
import {
  createId,
  createTileBag,
  drawTiles,
  removeWordTiles,
  shuffleTiles,
  tileValues,
} from "./word-game-tiles";

export {
  DEFAULT_TARGET_SCORE,
  MIN_WORD_LENGTH,
  RACK_SIZE,
  type GameState,
  type MatchEvent,
  type PlayedWord,
  type PlayerId,
  type PlayerState,
  type SubmitWordResult,
  type Tile,
  type WordScore,
} from "./word-game-types";

export function createGame(targetScore: number): GameState {
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
  const playedWord = {
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
  const finishEvent = createFinishEvent(
    reachedTarget,
    player.id,
    player.name,
    nextPlayers["player-one"].score,
    nextPlayers["player-two"].score,
    nextPlayedWords,
  );

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

export function scoreWord(word: string): WordScore {
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

export function canBuildWord(rack: Tile[], rawWord: string): boolean {
  const rackCounts = countLetters(rack.map((tile) => tile.letter));
  const wordCounts = countLetters(normalizeWord(rawWord).split(""));

  return Object.entries(wordCounts).every(
    ([letter, count]) => (rackCounts[letter] ?? 0) >= count,
  );
}

export function getPlayableRackLetters(rack: Tile[]): string {
  return rack.map((tile) => tile.letter).join("");
}

function createFinishEvent(
  reachedTarget: boolean,
  playerId: PlayerId,
  playerName: string,
  playerOneScore: number,
  playerTwoScore: number,
  playedWords: GameState["playedWords"],
): MatchEvent | null {
  if (!reachedTarget) {
    return null;
  }

  return {
    type: "match_finished",
    winnerId: playerId,
    winnerName: playerName,
    finalScores: {
      "player-one": playerOneScore,
      "player-two": playerTwoScore,
    },
    playedWords,
    timestamp: new Date().toISOString(),
  };
}

function normalizeWord(word: string): string {
  return word.replace(/[^a-z]/gi, "").toUpperCase();
}

function getNextPlayerId(playerId: PlayerId): PlayerId {
  return playerId === "player-one" ? "player-two" : "player-one";
}

function countLetters(letters: string[]): Record<string, number> {
  return letters.reduce<Record<string, number>>((counts, letter) => {
    counts[letter] = (counts[letter] ?? 0) + 1;
    return counts;
  }, {});
}
