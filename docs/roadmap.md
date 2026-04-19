# Roadmap

This roadmap follows the overview while staying grounded in the current repo.

## Phase 1: Align Current Contracts

- Make the API matchmaking DTO match `PlayerQueuedEvent`.
- Use one queue name for API publishing, Bull Board display, and worker consumption.
- Standardize region values across tests, shared types, API requests, and worker logic.
- Fix root development scripts so `npm run dev` starts real services.
- Decide whether `apps/elo` is a separate service or a package used by the API.

## Phase 2: Complete Matchmaking

- Persist a `Match` and `MatchParticipant` rows when the worker finds a pair.
- Remove or complete queue jobs for matched players.
- Prevent duplicate queue entries for the same player.
- Add queue leave/cancel support.
- Add integration tests around enqueue -> worker -> persisted match.

## Phase 3: Match Results and Ratings

- Add result reporting endpoint.
- Add winner/outcome fields to the data model.
- Implement an initial ELO update algorithm.
- Store rating history per match.
- Add tests for expected rating deltas.

## Phase 4: Player Experience

- Add player stats and match history endpoints.
- Add leaderboard endpoints.
- Add client views for queue state, profiles, match history, and leaderboard.
- Add WebSocket or server-sent event updates for queue/match status.

## Phase 5: Operations

- Add structured logging.
- Add health checks for API, Redis, Postgres, and workers.
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
