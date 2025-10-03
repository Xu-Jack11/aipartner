export type AuthUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
};

export type AuthResult = {
  readonly accessToken: string;
  readonly user: AuthUser;
};

export type JwtPayload = {
  readonly sub: string;
  readonly email: string;
  readonly displayName: string;
  readonly iat?: number;
  readonly exp?: number;
};
