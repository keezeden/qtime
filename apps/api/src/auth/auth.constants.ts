export const ACCESS_TOKEN_COOKIE = 'qtime_access';
export const REFRESH_TOKEN_COOKIE = 'qtime_refresh';
export const SESSION_ID_COOKIE = 'qtime_session';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'qtime-dev-access-secret';
