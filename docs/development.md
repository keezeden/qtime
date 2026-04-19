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
```

For local host-based development, `POSTGRES_HOST` and `REDIS_HOST` should usually be `localhost`.

For Docker Compose services talking to each other, use service names such as `db` and `redis`.

## Install

From the repo root:

```bash
npm install
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

## API Development

Run the NestJS API:

```bash
npm --prefix apps/api run start:dev
```

The API runs database migrations before starting in watch mode.

Useful API commands:

```bash
npm --prefix apps/api run db:migrate
npm --prefix apps/api run db:migrate:dev
npm --prefix apps/api run db:studio
npm --prefix apps/api run test
npm --prefix apps/api run lint
```

## Matchmaking Worker Development

Run the worker:

```bash
npm --prefix apps/matchmaking run start:dev
```

Run worker tests:

```bash
npm --prefix apps/matchmaking run test
```

## Client Development

Run the Next.js app:

```bash
npm --prefix apps/client run dev
```

## Docker Stack

Build and start the full stack:

```bash
npm run stack:up
```

Containerized services need container-reachable environment values. Use `db` for Postgres and `redis` for Redis when the API or worker runs inside Compose.

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

- If the API cannot connect to Postgres, check that `infra` is running and the host/port values match the environment you are using.
- If Redis queue jobs are not visible to the worker, check that the queue names match across `EventsModule`, `EventsService`, and `apps/matchmaking`.
- If Prisma cannot resolve its generated client, run the API migration or Prisma generate flow from `apps/api`.
- If Docker services cannot reach each other, use Compose service names (`db`, `redis`) instead of `localhost`.
