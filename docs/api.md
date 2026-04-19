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

Queue a player for matchmaking.

Current API DTO:

```json
{
  "id": "1"
}
```

Target event shape:

```json
{
  "jobType": "matchmaking.queued",
  "userId": 1,
  "startTime": "2026-04-19T00:00:00.000Z",
  "region": "oce",
  "elo": 1200
}
```

Successful response:

```json
{
  "jobId": "..."
}
```

Implementation note: the target event shape is already defined in `packages/types`, but the API DTO should be expanded before the endpoint is treated as stable.

## Queue Dashboard

### `GET /queues`

Bull Board route configured by the API.

Implementation note: this depends on BullMQ queue registration being aligned with the queue used by `EventsService`.
