-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW', 'ABANDONED');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'word-duel',
ADD COLUMN "region" TEXT NOT NULL DEFAULT 'oce',
ADD COLUMN "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "finishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MatchParticipant" ADD COLUMN "usernameSnapshot" TEXT NOT NULL DEFAULT '',
ADD COLUMN "eloSnapshot" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN "result" "MatchResult";

-- CreateTable
CREATE TABLE "GameState" (
    "matchId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameEvent_matchId_version_key" ON "GameEvent"("matchId", "version");

-- CreateIndex
CREATE INDEX "GameEvent_matchId_idx" ON "GameEvent"("matchId");

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEvent" ADD CONSTRAINT "GameEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
