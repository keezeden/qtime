import type {
  CtaButton,
  FeatureCard,
  FloatingAccent,
  FlowStep,
  LeaderboardEntry,
  MatchmakingCard,
  NavLink,
  ScoreRaceEntry,
} from "./types";

export const navLinks: NavLink[] = [
  { href: "#home", label: "Home", active: true },
  { href: "#flow", label: "Rules" },
  { href: "#matchmaking", label: "Matchmaking" },
  { href: "#snapshot", label: "Score Race" },
  { href: "#cta", label: "Queue" },
];

export const floatingAccents: FloatingAccent[] = [
  {
    className:
      "tile-shadow-pink absolute top-12 left-[5%] flex h-20 w-20 rotate-12 items-center justify-center border-2 border-accent-pink bg-accent-pink/10 font-display text-3xl font-bold text-accent-pink",
    content: "Q",
  },
  {
    className:
      "absolute top-28 right-[9%] flex h-12 w-12 -rotate-12 items-center justify-center rounded-full border-2 border-accent-yellow/50 bg-accent-yellow/10 font-display text-xl font-bold text-accent-yellow",
    content: "2x",
  },
  {
    className:
      "tile-shadow-teal absolute right-[6%] bottom-24 flex h-18 w-18 -rotate-6 items-center justify-center border-2 border-accent-teal bg-accent-teal/10 font-display text-3xl font-bold text-accent-teal",
    content: "T",
  },
  {
    className: "absolute top-[64%] left-[16%] h-1 w-18 -rotate-45 bg-accent-teal",
  },
  {
    className: "absolute top-[37%] right-[18%] h-1 w-12 rotate-45 bg-accent-yellow",
  },
];

export const featureCards: FeatureCard[] = [
  {
    title: "Real-Time Duels",
    description:
      "No waiting days for a turn. Fast score-pressure word battles with explosive comeback windows.",
    className: "panel-shadow border-2 border-border bg-surface-strong px-6 py-7",
    headerVariant: "bolt",
  },
  {
    title: "No Board Required",
    description:
      "Build the highest scoring word from your rack, bank the points, then brace for the answer.",
    className:
      "panel-shadow rotate-1 border-2 border-accent-pink bg-accent-pink px-6 py-7 text-[#481227]",
    descriptionClassName: "text-sm leading-7",
    headerVariant: "tiles",
  },
];

export const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: "01",
    name: "Lexi Loop",
    score: "23,840 PTS",
    scoreClassName: "text-accent-teal",
  },
  {
    rank: "02",
    name: "Wordwisp",
    score: "21,970 PTS",
    scoreClassName: "text-accent-pink",
  },
];

export const flowSteps: FlowStep[] = [
  {
    value: "1",
    label: "Draw",
    description: "Take your rack and read the turn before your rival does.",
    valueClassName: "text-accent-pink",
  },
  {
    value: "2",
    label: "Build",
    description: "Find the highest-value word hiding in the tile spread.",
    valueClassName: "text-accent-teal",
  },
  {
    value: "3",
    label: "Score",
    description: "Bank the turn, swing the lead, and punish soft answers.",
    valueClassName: "text-accent-yellow",
  },
  {
    value: "4",
    label: "500",
    description: "First player to 500 closes the duel.",
    valueClassName: "text-accent-green",
  },
];

export const matchmakingCards: MatchmakingCard[] = [
  {
    title: "Quick Pairing",
    description:
      "Spend less time in menus and more time hunting the next high-value word.",
    className: "panel-shadow -rotate-2 border-2 border-accent-pink bg-surface px-5 py-6",
    titleClassName: "text-accent-pink",
  },
  {
    title: "Fairer Duels",
    description:
      "Close score lines make every rack matter and every comeback believable.",
    className: "panel-shadow rotate-2 border-2 border-accent-teal bg-surface px-5 py-6",
    titleClassName: "text-accent-teal",
  },
  {
    title: "Replay Loop",
    description:
      "Better opponents make the climb worth chasing after each weekly reset.",
    className: "panel-shadow -rotate-1 border-2 border-accent-yellow bg-surface px-5 py-6",
    titleClassName: "text-accent-yellow",
  },
];

export const scoreRaceEntries: ScoreRaceEntry[] = [
  {
    player: "You",
    score: "428",
    delta: "+72",
    tiles: ["Q", "U", "A", "R", "T", "Z"],
    className: "border-accent-teal bg-accent-teal/10 text-accent-teal",
  },
  {
    player: "Rival",
    score: "463",
    delta: "+96",
    tiles: ["J", "O", "L", "T", "E", "D"],
    className: "border-accent-pink bg-accent-pink/10 text-accent-pink",
  },
  {
    player: "Target",
    score: "500",
    delta: "finish",
    tiles: ["R", "A", "C", "E"],
    className: "border-accent-yellow bg-accent-yellow/10 text-accent-yellow",
  },
];

export const ctaButtons: CtaButton[] = [
  {
    href: "/signup",
    label: "Play Now",
    className:
      "pressable-pink font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-pink px-8 py-4 text-base font-bold uppercase text-[#140812]",
  },
  {
    href: "/login",
    label: "Login",
    className:
      "pressable-teal font-display inline-flex min-h-13 items-center justify-center border-2 border-black bg-accent-teal px-8 py-4 text-base font-bold uppercase text-[#081312]",
  },
];
