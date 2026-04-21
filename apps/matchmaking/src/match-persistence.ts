import type { MatchmakingPair, QueuedPlayer } from "@qtime/types";
import { Pool, PoolClient } from "pg";
import { getDatabaseUrl } from "./database-url";

type InitialGameState = {
  mode: MatchmakingPair["mode"];
  region: MatchmakingPair["region"];
  status: "active";
  players: {
    userId: number;
    username: string;
    elo: number;
    seat: number;
  }[];
  createdAt: string;
};

const MAX_ATTEMPTS = 3;

const PLAYER_SEATS: [number, number] = [0, 1];

const createInitialGameState = (pair: MatchmakingPair): InitialGameState => ({
  mode: pair.mode,
  region: pair.region,
  status: "active",
  players: pair.players.map((player, index) => ({
    userId: player.userId,
    username: player.username,
    elo: player.elo,
    seat: PLAYER_SEATS[index],
  })),
  createdAt: pair.matchedAt,
});

const ensureUserExists = async (client: PoolClient, player: QueuedPlayer): Promise<void> => {
  await client.query(
    `
      INSERT INTO "User" ("id", "username", "createdAt", "updatedAt")
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING
    `,
    [player.userId, player.username],
  );
};

const insertParticipant = async (
  client: PoolClient,
  matchId: number,
  player: QueuedPlayer,
  seat: number,
): Promise<void> => {
  await client.query(
    `
      INSERT INTO "MatchParticipant"
        ("matchId", "userId", "seat", "usernameSnapshot", "eloSnapshot")
      VALUES ($1, $2, $3, $4, $5)
    `,
    [matchId, player.userId, seat, player.username, player.elo],
  );
};

export class MatchPersistence {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  async persistPair(pair: MatchmakingPair): Promise<number> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await this.persistPairOnce(pair);
      } catch (error) {
        console.warn("Match persistence attempt failed", {
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          mode: pair.mode,
          region: pair.region,
          playerUserIds: pair.players.map((player) => player.userId),
          error,
        });

        if (attempt === MAX_ATTEMPTS) throw error;
      }
    }

    throw new Error("Match persistence exhausted attempts without returning a result.");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async cancelMatch(matchId: number, reason: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE "Match"
        SET "status" = 'CANCELLED', "finishedAt" = NOW()
        WHERE "id" = $1
      `,
      [matchId],
    );

    await this.pool.query(
      `
        UPDATE "GameState"
        SET "status" = 'cancelled',
            "state" = "state" || $2::jsonb,
            "updatedAt" = NOW()
        WHERE "matchId" = $1
      `,
      [matchId, JSON.stringify({ status: "cancelled", cancellationReason: reason })],
    );
  }

  private async persistPairOnce(pair: MatchmakingPair): Promise<number> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      for (const player of pair.players) {
        await ensureUserExists(client, player);
      }

      const matchResult = await client.query<{ id: number }>(
        `
          INSERT INTO "Match" ("mode", "region", "status", "startedAt")
          VALUES ($1, $2, 'ACTIVE', NOW())
          RETURNING "id"
        `,
        [pair.mode, pair.region],
      );
      const matchId = matchResult.rows[0]?.id;

      if (!matchId) {
        throw new Error("Match creation failed: INSERT returned no match id.");
      }

      for (const [index, player] of pair.players.entries()) {
        await insertParticipant(client, matchId, player, PLAYER_SEATS[index]);
      }

      await client.query(
        `
          INSERT INTO "GameState" ("matchId", "version", "status", "state", "updatedAt")
          VALUES ($1, 0, 'active', $2, NOW())
        `,
        [matchId, JSON.stringify(createInitialGameState(pair))],
      );

      await client.query("COMMIT");

      return matchId;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.warn("Match persistence rollback failed", {
          mode: pair.mode,
          region: pair.region,
          playerUserIds: pair.players.map((player) => player.userId),
          rollbackError,
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
