import type { GameState, PlayerId } from "@qtime/game";
import { Pool } from "pg";
import { getDatabaseUrl } from "./database-url";

export type PersistedGameEventType =
  | "word_submitted"
  | "rack_refreshed"
  | "rack_shuffled"
  | "match_finished";

export type PersistAcceptedUpdateInput = {
  matchId: number;
  version: number;
  state: GameState;
  event: {
    playerId: PlayerId;
    type: PersistedGameEventType;
    payload: Record<string, unknown>;
  };
  playerUserIds: Record<PlayerId, number>;
};

export class GamePersistence {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  async persistAcceptedUpdate(input: PersistAcceptedUpdateInput): Promise<void> {
    const client = await this.pool.connect();
    const userId = input.playerUserIds[input.event.playerId];

    try {
      await client.query("BEGIN");
      const insertResult = await client.query<{ id: number }>(
        `
          INSERT INTO "GameEvent" ("matchId", "version", "userId", "type", "payload", "createdAt")
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT ("matchId", "version") DO NOTHING
          RETURNING "id"
        `,
        [
          input.matchId,
          input.version,
          userId,
          input.event.type,
          JSON.stringify({
            ...input.event.payload,
            nextState: input.state,
          }),
        ],
      );

      if (insertResult.rowCount !== 1) {
        throw new Error(
          `Game event version conflict: ${JSON.stringify({
            matchId: input.matchId,
            version: input.version,
            eventType: input.event.type,
          })}`,
        );
      }

      const updateResult = await client.query(
        `
          UPDATE "GameState"
          SET "version" = $2,
              "status" = $3,
              "state" = $4::jsonb ||
                CASE
                  WHEN "state" ? 'gameServer'
                    THEN jsonb_build_object('gameServer', "state"->'gameServer')
                  ELSE '{}'::jsonb
                END,
              "updatedAt" = NOW()
          WHERE "matchId" = $1
        `,
        [
          input.matchId,
          input.version,
          input.state.status === "finished" ? "finished" : "active",
          JSON.stringify(input.state),
        ],
      );

      if (updateResult.rowCount !== 1) {
        throw new Error(
          `Game state update failed: ${JSON.stringify({
            matchId: input.matchId,
            version: input.version,
            eventType: input.event.type,
            updatedRows: updateResult.rowCount,
          })}`,
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.warn("Game persistence rollback failed", {
          matchId: input.matchId,
          version: input.version,
          rollbackError,
        });
      }

      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
