# QTime

QTime is a monorepo for building a production-style matchmaking backend. The project models the infrastructure around competitive game queues: players enter a queue, a worker finds fair matches by region/rating/wait time, matches are created, results are processed, and ratings are updated.

The gameplay can stay intentionally simple. The point of QTime is the backend and DevOps surface area: API design, database modeling, Redis-backed queues, background workers, rating algorithms, containerized services, and eventually observability and deployment.

## Monorepo Layout

```text
apps/
  api/           NestJS API, Prisma client, BullMQ producer
  client/        Next.js frontend/marketing app
  matchmaking/   Queue polling worker and matching algorithm
  elo/           Placeholder for rating service work
packages/
  types/         Shared TypeScript event and domain types
infra/
  docker-compose.yml  Postgres and Redis for local infrastructure
docs/
  Project documentation
```

## Current Services

- `apps/api`: exposes user CRUD endpoints and a matchmaking queue endpoint. Uses NestJS, Prisma, BullMQ, Postgres, and Redis.
- `apps/matchmaking`: polls the matchmaking queue, groups players by mode and region, and pairs players whose ELO difference fits an expanding wait-time window.
- `packages/types`: shared event payloads and domain primitives used by services.
- `apps/client`: Next.js app for the project-facing UI.
- `infra`: local Postgres and Redis services.

## Quick Start

Install workspace dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Bootstrap local infrastructure and the API database client/migrations:

```bash
npm run setup:local
```

Start Postgres and Redis:

```bash
npm run infra:up
```

Run the API, matchmaking worker, and client locally against Docker-hosted Postgres and Redis:

```bash
npm run dev:app
```

The API listens on `http://localhost:3000` and the client dev server listens on `http://localhost:3001`.

Run only the API with local infrastructure:

```bash
npm run dev:api:local
```

Run the API in development mode after infrastructure is already running:

```bash
npm run dev:api
```

Run the matchmaking worker:

```bash
npm run dev:matchmaking
```

Or run the Docker stack:

```bash
npm run dev:full
```

When running services inside Docker, make sure the environment uses container hostnames such as `db` and `redis` rather than `localhost`.

The API listens on `http://localhost:3000` by default.

## Documentation

- [Project Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development.md)
- [API Reference](docs/api.md)
- [Data Model](docs/data-model.md)
- [Roadmap](docs/roadmap.md)

## Current Implementation Notes

QTime is in an early build phase. A few contracts still need alignment as features harden:

- The matchmaking queue contract is shared through `packages/types`.
- The matchmaking worker currently logs matched pairs; match persistence and queue cleanup are still future work.
- Ratings are not persisted yet; matchmaking enqueues players with a temporary `elo` value of `1200`.

These are documented deliberately so the next implementation steps are visible instead of hidden in code.
