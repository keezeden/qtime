# Roadmap

This roadmap follows the overview while staying grounded in the current repo.

## Phase 1: Align Current Contracts

- Prevent duplicate queue entries for the same player.
- Fix root development scripts so `npm run dev` starts real services.
- Decide whether `apps/elo` is a separate service or a package used by the API.

## Phase 2: Complete Matchmaking

- Add queue leave/cancel support.
- Add integration tests around enqueue -> worker -> persisted match.

## Phase 3: Multiplayer Game State

- Broadcast accepted updates to match participants.

## Phase 4: Match Results and Ratings

- Decide whether terminal game events are enough for result reporting or whether a separate admin/server result endpoint is needed.
- Add explicit winner/outcome fields to `Match` if match queries need them without joining participants.
- Extend or tune the initial ELO update algorithm.
- Broaden rating tests when draw, abandonment, or rematch cases exist.

## Phase 5: Player Experience

- Add player stats and match history endpoints.
- Add leaderboard endpoints.
- Add client views for queue state, profiles, match history, and leaderboard.
- Add WebSocket or server-sent event updates for queue/match status.

## Phase 6: Operations

- Add structured logging.
- Add health checks for API, Redis, Postgres, and workers.
- Extract Prisma schema, migrations, and generated client into a shared package used by API and workers so workers can stop using raw SQL for persistence.
- Evaluate a strict runtime validation library such as Zod for HTTP/WebSocket payload parsing instead of hand-written object checks.
- Add CI for lint, test, build, and Docker image validation.
- Add metrics for queue size, wait time, match quality, match creation rate, and worker failures.
- Add deployment documentation for a target cloud environment.

## Optional Extensions

- Party or team matchmaking.
- Regional servers.
- Bot players to keep queues active.
- Anti-smurf heuristics.
- Replay or event log storage.
- Analytics pipeline.
- Admin dashboard.
- Multiple game modes.
