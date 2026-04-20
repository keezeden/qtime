-- DropForeignKey
ALTER TABLE "ParticipantStatistics" DROP CONSTRAINT "ParticipantStatistics_matchId_userId_fkey";

-- DropTable
DROP TABLE "ParticipantStatistics";

-- AlterTable
ALTER TABLE "MatchParticipant" ADD COLUMN "seat" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing participant seats deterministically per match.
WITH ranked_participants AS (
    SELECT
        "matchId",
        "userId",
        ROW_NUMBER() OVER (PARTITION BY "matchId" ORDER BY "userId") - 1 AS "seat"
    FROM "MatchParticipant"
)
UPDATE "MatchParticipant"
SET "seat" = ranked_participants."seat"
FROM ranked_participants
WHERE "MatchParticipant"."matchId" = ranked_participants."matchId"
AND "MatchParticipant"."userId" = ranked_participants."userId";

-- AlterTable
ALTER TABLE "MatchParticipant" DROP COLUMN "team";

-- DropEnum
DROP TYPE "Team";
