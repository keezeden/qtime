export type AuthUser = {
  id: number;
  username: string;
  nametag: string | null;
};

export type AccessTokenPayload = {
  sub: number;
  username: string;
};
