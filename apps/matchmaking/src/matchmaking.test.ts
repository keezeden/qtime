import { PlayerQueuedEvent, Region } from "@qtime/types";
import { findMatches, getRegionMatches } from "./matchmaking";

function makePlayer(input: {
  userId: string;
  region: string;
  elo: number;
  startTime: string;
}): PlayerQueuedEvent {
  return {
    userId: input.userId,
    region: input.region as Region,
    elo: input.elo,
    startTime: input.startTime,
  } as unknown as PlayerQueuedEvent;
}

describe("findMatches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("matches players when elo difference is within time-based window", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:01:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: "p1",
        region: "NA",
        elo: 1000,
        startTime: "2026-01-01T00:00:10.000Z",
      }),
      makePlayer({
        userId: "p2",
        region: "NA",
        elo: 1200,
        startTime: "2026-01-01T00:00:20.000Z",
      }),
    ];

    const matches = findMatches("NA" as Region, players);

    expect(matches).toHaveLength(1);
    expect(matches[0].map((player) => player.userId)).toEqual(["p1", "p2"]);
  });

  it("does not match players when elo difference exceeds the current window", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:00:10.000Z").getTime());

    const players = [
      makePlayer({
        userId: "p1",
        region: "NA",
        elo: 1000,
        startTime: "2026-01-01T00:00:05.000Z",
      }),
      makePlayer({
        userId: "p2",
        region: "NA",
        elo: 1010,
        startTime: "2026-01-01T00:00:05.000Z",
      }),
    ];

    const matches = findMatches("NA" as Region, players);

    expect(matches).toEqual([]);
  });

  it("does not include the same player in more than one match", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:02:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: "p1",
        region: "NA",
        elo: 1000,
        startTime: "2026-01-01T00:00:00.000Z",
      }),
      makePlayer({
        userId: "p2",
        region: "NA",
        elo: 1010,
        startTime: "2026-01-01T00:00:01.000Z",
      }),
      makePlayer({
        userId: "p3",
        region: "NA",
        elo: 1020,
        startTime: "2026-01-01T00:00:02.000Z",
      }),
    ];

    const matches = findMatches("NA" as Region, players);

    expect(matches).toHaveLength(1);
    expect(matches[0].map((player) => player.userId)).toEqual(["p1", "p2"]);
  });
});

describe("getRegionMatches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("matches players per region and aggregates all regional matches", () => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-01-01T00:02:00.000Z").getTime());

    const players = [
      makePlayer({
        userId: "na-1",
        region: "NA",
        elo: 1000,
        startTime: "2026-01-01T00:00:00.000Z",
      }),
      makePlayer({
        userId: "na-2",
        region: "NA",
        elo: 1030,
        startTime: "2026-01-01T00:00:01.000Z",
      }),
      makePlayer({
        userId: "eu-1",
        region: "EU",
        elo: 1500,
        startTime: "2026-01-01T00:00:00.000Z",
      }),
      makePlayer({
        userId: "eu-2",
        region: "EU",
        elo: 1520,
        startTime: "2026-01-01T00:00:01.000Z",
      }),
    ];

    const regionalQueues = players.reduce(
      (acc, player) => {
        const queue = acc[player.region] ?? [];
        queue.push(player);
        acc[player.region] = queue;
        return acc;
      },
      {} as Record<Region, PlayerQueuedEvent[]>,
    );

    const matches = getRegionMatches(regionalQueues);

    expect(matches).toHaveLength(2);
    const ids = matches.map((pair) => pair.map((player) => player.userId).sort().join("-"));
    expect(ids).toEqual(expect.arrayContaining(["na-1-na-2", "eu-1-eu-2"]));
  });
});
