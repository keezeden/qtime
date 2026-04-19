export type NavLink = {
  href: string;
  label: string;
  active?: boolean;
};

export type FloatingAccent = {
  className: string;
  content?: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  className: string;
  headerVariant: "bolt" | "tiles";
  descriptionClassName?: string;
};

export type LeaderboardEntry = {
  rank: string;
  name: string;
  score: string;
  scoreClassName: string;
};

export type ScoreRaceEntry = {
  player: string;
  score: string;
  delta: string;
  tiles: string[];
  className: string;
};

export type FlowStep = {
  value: string;
  label: string;
  description: string;
  valueClassName: string;
};

export type MatchmakingCard = {
  title: string;
  description: string;
  className: string;
  titleClassName: string;
};

export type CtaButton = {
  href: string;
  label: string;
  className: string;
};
