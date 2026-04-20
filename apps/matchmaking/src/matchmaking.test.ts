import { QueuedPlayer } from "@qtime/types";
import { findMatches, getGroupedMatches, groupPlayersByModeAndRegion } from "./matchmaking";

function makePlayer(input: {
  userId: number;
  username: string;
  region: QueuedPlayer["region"];
  elo: number;
  queuedAt: string;
  mode: QueuedPlayer["mode"];
}): QueuedPlayer {
  return {
    userId: input.userId,
    username: input.username,
    region: input.region,
    elo: input.elo,
    mode: input.mode,
    queuedAt: input.queuedAt,
  };
}

describe("findMatches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("matches players when elo difference is within time-based window", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:01:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: 1,
        username: "p1",
        region: "na",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:10.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 2,
        username: "p2",
        region: "na",
        elo: 1200,
        queuedAt: "2026-01-01T00:00:20.000Z",
        mode: "word-duel",
      }),
    ];

    const matches = findMatches(players);

    expect(matches).toHaveLength(1);
    expect(matches[0].players.map((player) => player.userId)).toEqual([1, 2]);
    expect(matches[0]).toMatchObject({ mode: "word-duel", region: "na" });
  });

  it("does not match players when elo difference exceeds the current window", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:00:10.000Z").getTime());

    const players = [
      makePlayer({
        userId: 1,
        username: "p1",
        region: "na",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:05.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 2,
        username: "p2",
        region: "na",
        elo: 1010,
        queuedAt: "2026-01-01T00:00:05.000Z",
        mode: "word-duel",
      }),
    ];

    const matches = findMatches(players);

    expect(matches).toEqual([]);
  });

  it("does not include the same player in more than one match", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:02:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: 1,
        username: "p1",
        region: "na",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:00.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 2,
        username: "p2",
        region: "na",
        elo: 1010,
        queuedAt: "2026-01-01T00:00:01.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 3,
        username: "p3",
        region: "na",
        elo: 1020,
        queuedAt: "2026-01-01T00:00:02.000Z",
        mode: "word-duel",
      }),
    ];

    const matches = findMatches(players);

    expect(matches).toHaveLength(1);
    expect(matches[0].players.map((player) => player.userId)).toEqual([1, 2]);
  });
});

describe("getGroupedMatches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("matches players per mode and region and aggregates grouped matches", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:02:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: 1,
        username: "na-1",
        region: "na",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:00.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 2,
        username: "na-2",
        region: "na",
        elo: 1030,
        queuedAt: "2026-01-01T00:00:01.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 3,
        username: "eu-1",
        region: "eu",
        elo: 1500,
        queuedAt: "2026-01-01T00:00:00.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 4,
        username: "eu-2",
        region: "eu",
        elo: 1520,
        queuedAt: "2026-01-01T00:00:01.000Z",
        mode: "word-duel",
      }),
    ];

    const groupedQueues = groupPlayersByModeAndRegion(players);

    const matches = getGroupedMatches(groupedQueues);

    expect(matches).toHaveLength(2);
    const ids = matches.map((pair) => pair.players.map((player) => player.username).sort().join("-"));
    expect(ids).toEqual(expect.arrayContaining(["na-1-na-2", "eu-1-eu-2"]));
  });

  it("does not match players from different regions", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:02:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: 1,
        username: "na-1",
        region: "na",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:00.000Z",
        mode: "word-duel",
      }),
      makePlayer({
        userId: 2,
        username: "eu-1",
        region: "eu",
        elo: 1000,
        queuedAt: "2026-01-01T00:00:00.000Z",
        mode: "word-duel",
      }),
    ];

    const matches = getGroupedMatches(groupPlayersByModeAndRegion(players));

    expect(matches).toEqual([]);
  });
});
