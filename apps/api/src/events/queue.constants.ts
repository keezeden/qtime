export const MATCHMAKING_QUEUE_NAME = process.env.MATCHMAKING_QUEUE_NAME ?? "matchmaking";

export const BULL_BOARD_ENABLED =
  process.env.BULL_BOARD_ENABLED === "true" || process.env.NODE_ENV !== "production";
