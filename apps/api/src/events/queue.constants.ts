export const MATCHMAKING_QUEUED_JOB_NAME = "matchmaking.queued";

export const BULL_BOARD_ENABLED =
  process.env.BULL_BOARD_ENABLED === "true" || process.env.NODE_ENV !== "production";
