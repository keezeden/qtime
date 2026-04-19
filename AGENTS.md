# QTime Agent Index

This file is a navigation guide for AI agents working in the QTime monorepo. Read it first, then open the docs that match the task.

## Start Here

- `README.md`: repo overview, quick start, service list, and current implementation notes.
- `docs/overview.md`: product/system context and what QTime is trying to demonstrate.
- `docs/architecture.md`: service boundaries, queue flow, matchmaking algorithm, and known contract alignment work.
- `docs/development.md`: setup commands, Docker/local environment guidance, tests, and troubleshooting.
- `docs/api.md`: current HTTP endpoints and planned matchmaking payload shape.
- `docs/data-model.md`: current Prisma models and planned schema additions.
- `docs/roadmap.md`: implementation phases and likely next tasks.

## Task Routing

- API endpoints, Nest modules, Prisma service, BullMQ producer: read `docs/api.md`, `docs/architecture.md`, and `docs/development.md`.
- Matchmaking worker, queue polling, ELO window behavior: read `docs/architecture.md` and `docs/roadmap.md`.
- Database schema or migrations: read `docs/data-model.md` and `docs/development.md`.
- Local setup, Docker, Redis, Postgres, scripts: read `docs/development.md`.
- Product direction or scope questions: read `docs/overview.md` and `docs/roadmap.md`.
- Frontend work in `apps/client`: also read `apps/client/AGENTS.md`.

## Current Repo Shape

```text
apps/api/          NestJS API, Prisma, BullMQ producer
apps/client/       Next.js frontend
apps/matchmaking/  Matchmaking worker and tests
apps/elo/          Placeholder for future rating service
packages/types/    Shared TypeScript types
infra/             Local Postgres and Redis Compose services
docs/              Project documentation
```

## Important Context

- There are known mismatches between the intended queue payload and the current API DTO.
- Queue names should be aligned before relying on end-to-end matchmaking.
- The matchmaking worker currently finds and logs pairs; persistence and queue cleanup are still planned.
- Rating updates are planned but not implemented yet.
- Avoid touching unrelated dirty files unless the user explicitly asks.
