export type FeatureCard = {
  tag?: string;
  title: string;
  description: string;
};

export type LeaderboardEntry = {
  rank: string;
  name: string;
  points: string;
  accentClassName: string;
  rotateClassName: string;
  backgroundClassName: string;
};

export type Testimonial = {
  quote: string;
  handle: string;
  imageSrc: string;
  imageAlt: string;
  borderClassName: string;
  shadowClassName: string;
  accentClassName: string;
  rotateClassName: string;
  offsetClassName: string;
};
