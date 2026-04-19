# Project Overview

QTime is a backend and DevOps learning project that simulates a modern skill-based matchmaking system like the ones used by online competitive games.

The project is not primarily about building a full game. The game can be a simple bot simulation, word game, or test harness. The interesting work is the platform around it: queues, matchmaking, match creation, match results, rating updates, workers, deployment, and operational visibility.

## Core Loop

1. A player joins a matchmaking queue.
2. The system considers region, rating, and time spent waiting.
3. A match is created when compatible players are found.
4. The match is played or simulated.
5. A result is reported.
6. Player ratings and stats are updated.
7. Players can re-enter the queue.

## What QTime Demonstrates

- API design for player, queue, match, and result workflows.
- PostgreSQL schema design with Prisma.
- Redis-backed queues and worker processing.
- Matchmaking algorithms that trade fairness against wait time.
- Rating systems such as ELO, Glicko, or TrueSkill-style approaches.
- Background worker ownership and service boundaries.
- Dockerized local infrastructure.
- Future CI/CD, monitoring, logging, and cloud deployment.

## Product Scope

The intended product shape is a mini online game backend:

- Players register and maintain rating history.
- Players queue by region and rating.
- Workers create fair 1v1 matches.
- Results update stats and ratings.
- Optional frontend views expose queue state, player profiles, match history, and leaderboards.

## Current Repo State

The repo already contains:

- A NestJS API in `apps/api`.
- A matchmaking worker in `apps/matchmaking`.
- Shared event/domain types in `packages/types`.
- A Next.js client in `apps/client`.
- Postgres and Redis local infrastructure in `infra`.
- An empty or placeholder `apps/elo` service location for future rating work.

The implementation is still early. The docs distinguish between "current" behavior and "target" architecture where relevant.
