# Development Guide

## Prerequisites

- Node.js 22 or compatible recent Node runtime.
- npm.
- Docker Desktop or another Docker Compose runtime.

## Environment

QTime uses `.env` for local development and `.env.docker` for container networking.

Required variables:

```text
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
POSTGRES_HOST
POSTGRES_PORT
REDIS_HOST
REDIS_PORT
GAME_SERVER_URL
GAME_SERVER_PUBLIC_URL
GAME_SERVER_PORT
```

For local host-based development, `POSTGRES_HOST` and `REDIS_HOST` should usually be `localhost`.

For Docker Compose services talking to each other, use service names such as `db` and `redis`.

Create a local environment file from the example:

```bash
cp .env.example .env
```

In PowerShell:

```powershell
Copy-Item .env.example .env
```

## Install

From the repo root:

```bash
npm install
```

For a first-time local setup, start infrastructure, generate Prisma artifacts, and apply deployed migrations:

```bash
npm run setup:local
```

## Local Infrastructure

Start only Postgres and Redis:

```bash
npm run infra:up
```

Stop them:

```bash
npm run infra:down
```

Follow logs:

```bash
npm run infra:logs
```

## Recommended Local Workflow

The default local flow is a hybrid setup:

- Docker runs Postgres and Redis.
- Node runs the API, matchmaking worker, and client from the host.
- Root scripts load `.env` once and pass that environment into app package scripts.

Run the API, worker, game server, and client together:

```bash
npm run dev:app
```

This starts the API on `http://localhost:3000`, the game server on `http://localhost:3002`, and the client on `http://localhost:3001`.

Run the API with local infrastructure:

```bash
npm run dev:api:local
```

Run only the API, matchmaking worker, and game server:

```bash
npm run dev:backend
```

Run the game server scaffold:

```bash
npm run dev:game-server
```

The game server listens on `GAME_SERVER_PORT` and exposes `GET /health`. The matchmaking worker calls `GAME_SERVER_URL` after creating a durable match row and stores browser-facing connection metadata from `GAME_SERVER_PUBLIC_URL`.

## API Development

Run the NestJS API:

```bash
npm run dev:api
```

The root API script generates Prisma artifacts, applies deployed migrations, then starts the API in watch mode with the root `.env` loaded.
The root migration scripts start local Docker infrastructure before running Prisma, so direct migration commands can be used from a cold local environment.

Useful API commands:

```bash
npm run api:generate
npm run api:migrate
npm run api:migrate:dev
npm run api:studio
npm --prefix apps/api run test
npm --prefix apps/api run lint
```

## Matchmaking Worker Development

Run the worker:

```bash
npm run dev:matchmaking
```

Run worker tests:

```bash
npm --prefix apps/matchmaking run test
```

## Client Development

Run the Next.js app:

```bash
npm run dev:client
```

The client dev server uses `http://localhost:3001` so it can run alongside the API.

## Docker Stack

Build and start the full stack:

```bash
npm run stack:up
```

Containerized services need container-reachable environment values. Use `db` for Postgres, `redis` for Redis, `http://game-server:3002` for `GAME_SERVER_URL`, and a browser-reachable origin such as `http://localhost:3002` for `GAME_SERVER_PUBLIC_URL` when services run inside Compose.

Stop the full stack:

```bash
npm run stack:down
```

Follow stack logs:

```bash
npm run stack:logs
```

For foreground development with rebuilds:

```bash
npm run dev:full
```

## Testing

Run API unit tests:

```bash
npm --prefix apps/api run test
```

Run matchmaking worker tests:

```bash
npm --prefix apps/matchmaking run test
```

## Troubleshooting

- If a root script fails before starting a service, confirm `.env` exists. Copy `.env.example` to `.env` for local development.
- If the API cannot connect to Postgres, check that `infra` is running and the host/port values match the environment you are using.
- If Redis queue jobs are not visible to the worker, check that the queue names match across `EventsModule`, `EventsService`, and `apps/matchmaking`.
- If Prisma cannot resolve its generated client, run `npm run api:generate` from the repo root.
- If Docker services cannot reach each other, use Compose service names (`db`, `redis`) instead of `localhost`.
