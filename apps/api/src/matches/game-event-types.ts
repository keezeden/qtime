export const GAME_EVENT_TYPES = [
  'game_initialized',
  'word_submitted',
  'rack_refreshed',
  'rack_shuffled',
  'match_finished',
] as const;

export type GameEventType = (typeof GAME_EVENT_TYPES)[number];
