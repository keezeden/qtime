# API Reference

Base URL for local development:

```text
http://localhost:3000
```

The API is implemented in `apps/api` with NestJS.

## Health

### `GET /`

Returns the default application response from `AppController`.

## Users

Users are backed by the Prisma `User` model.

### `POST /user`

Create a user.

Request body:

```json
{
  "username": "keez",
  "nametag": "OCE"
}
```

Current fields:

- `username`: unique player name.
- `nametag`: optional display tag.

### `GET /user`

List all users.

### `GET /user/:id`

Get one user by numeric id.

### `PATCH /user/:id`

Update a user by numeric id.

Request body:

```json
{
  "username": "new-name",
  "nametag": "OCE"
}
```

All fields are optional for updates.

### `DELETE /user/:id`

Delete a user by numeric id.

## Auth

Auth uses username/password credentials, HTTP-only cookies, short-lived access tokens, and rotated refresh sessions.

### `POST /auth/signup`

Create a login-capable user and start a session.

Request body:

```json
{
  "username": "keez",
  "password": "password123",
  "nametag": "OCE"
}
```

Successful response:

```json
{
  "user": {
    "id": 1,
    "username": "keez",
    "nametag": "OCE"
  }
}
```

Sets HTTP-only `qtime_access`, `qtime_refresh`, and `qtime_session` cookies.

### `POST /auth/login`

Start a session for an existing auth user.

Request body:

```json
{
  "username": "keez",
  "password": "password123"
}
```

Successful response matches signup and refreshes the auth cookies.

### `POST /auth/refresh`

Rotate the refresh token and issue a new access token using the existing auth cookies.

Successful response:

```json
{
  "user": {
    "id": 1,
    "username": "keez",
    "nametag": "OCE"
  }
}
```

### `POST /auth/logout`

Revoke the current refresh session and clear auth cookies.

Successful response:

```json
{
  "ok": true
}
```

### `GET /auth/me`

Protected route. Returns the current authenticated user when the access token is valid.

Successful response:

```json
{
  "user": {
    "id": 1,
    "username": "keez",
    "nametag": "OCE"
  }
}
```

## Matchmaking

### `POST /matchmaking`

Queue the authenticated user for matchmaking.

Authentication is required. The client may only choose safe queue fields:

```json
{
  "region": "oce",
  "mode": "word-duel"
}
```

The API derives `userId` and `username` from the authenticated user, reads the user's current rating as `elo`, and sets `queuedAt` server-side.

Enqueued payload:

```json
{
  "userId": 1,
  "username": "keez",
  "region": "oce",
  "elo": 1200,
  "mode": "word-duel",
  "queuedAt": "2026-04-19T00:00:00.000Z"
}
```

Successful response:

```json
{
  "jobId": "..."
}
```

### `POST /matchmaking/leave`

Cancel a queued matchmaking job owned by the authenticated user. Authentication is required.

Request body:

```json
{
  "jobId": "..."
}
```

Successful response:

```json
{
  "removed": true
}
```

### `POST /matchmaking/dev`

Development-only endpoint for enqueueing synthetic players. In production this route returns `404`.

Request body:

```json
{
  "userId": 100,
  "username": "synthetic",
  "region": "oce",
  "elo": 1200,
  "mode": "word-duel"
}
```

The API still sets `queuedAt` server-side.

## Queue Dashboard

### `GET /queues`

Bull Board route configured by the API.

Implementation note: Bull Board uses the shared `MATCHMAKING_QUEUE_NAME` from `packages/types`.

## Matches

Match endpoints require authentication and only return matches where the authenticated user is a participant.

### `GET /matches/current`

Returns the latest active match for the authenticated user, or `null` when they are not in an active match.
When queueing for a new match, clients can pass `startedAfter` as an ISO timestamp to ignore older active matches from previous sessions.

Example:

```text
GET /matches/current?startedAfter=2026-04-21T00:00:00.000Z
```

Successful response:

```json
{
  "match": {
    "id": 1,
    "mode": "word-duel",
    "region": "oce",
    "status": "ACTIVE",
    "createdAt": "2026-04-20T00:00:00.000Z",
    "startedAt": "2026-04-20T00:00:01.000Z",
    "finishedAt": null,
    "matchParticipants": [
      {
        "userId": 1,
        "seat": 0,
        "usernameSnapshot": "keez",
        "eloSnapshot": 1200,
        "result": null
      },
      {
        "userId": 2,
        "seat": 1,
        "usernameSnapshot": "rival",
        "eloSnapshot": 1200,
        "result": null
      }
    ]
  }
}
```

### `GET /matches/:id`

Returns match metadata and participant snapshots for one match.

Successful response:

```json
{
  "match": {
    "id": 1,
    "mode": "word-duel",
    "region": "oce",
    "status": "ACTIVE",
    "createdAt": "2026-04-20T00:00:00.000Z",
    "startedAt": "2026-04-20T00:00:01.000Z",
    "finishedAt": null,
    "matchParticipants": []
  }
}
```

Returns `404` when the match does not exist or the authenticated user is not a participant.

### `GET /matches/:id/state`

Returns the latest persisted game state for one match.

Successful response:

```json
{
  "state": {
    "matchId": 1,
    "version": 0,
    "status": "active",
    "state": {
      "mode": "word-duel",
      "region": "oce",
      "status": "active",
      "players": []
    },
    "updatedAt": "2026-04-20T00:00:02.000Z"
  }
}
```

Returns `404` when the match does not exist, the authenticated user is not a participant, or the match has no persisted state.

### `GET /matches/:id/events`

Returns accepted game events for a match after an optional version. This is the polling endpoint clients can use while WebSocket updates are not implemented.

Query parameters:

- `afterVersion`: optional integer. Defaults to `0`.

Example:

```text
GET /matches/1/events?afterVersion=3
```

Successful response:

```json
{
  "events": [
    {
      "id": 10,
      "matchId": 1,
      "version": 4,
      "userId": 1,
      "type": "word_submitted",
      "payload": {
        "word": "crane"
      },
      "createdAt": "2026-04-20T00:00:03.000Z"
    }
  ]
}
```

### `POST /matches/:id/events`

Accepts a client-authoritative game event and advances the persisted game state when the submitted base version matches the current state version.
When the event type is `match_finished`, the API also marks the match finished, records participant results, updates player ratings, and stores rating history.

Request body:

```json
{
  "baseVersion": 0,
  "type": "word_submitted",
  "payload": {
    "word": "crane"
  },
  "stateStatus": "active",
  "nextState": {
    "phase": "submitted",
    "scores": {
      "1": 42,
      "2": 0
    }
  }
}
```

Successful response:

```json
{
  "event": {
    "id": 10,
    "matchId": 1,
    "version": 1,
    "userId": 1,
    "type": "word_submitted",
    "payload": {
      "word": "crane"
    },
    "createdAt": "2026-04-20T00:00:03.000Z"
  },
  "state": {
    "matchId": 1,
    "version": 1,
    "status": "active",
    "state": {
      "phase": "submitted",
      "scores": {
        "1": 42,
        "2": 0
      }
    },
    "updatedAt": "2026-04-20T00:00:03.000Z"
  }
}
```

Returns `409` when `baseVersion` does not match the current `GameState.version`.
