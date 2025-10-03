import { apiFetch } from "./client";

export type LoginRequest = {
  readonly email: string;
  readonly password: string;
};

export type AuthUserDto = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
};

export type AuthResultDto = {
  readonly accessToken: string;
  readonly user: AuthUserDto;
};

export const login = (payload: LoginRequest): Promise<AuthResultDto> =>
  apiFetch<AuthResultDto>("v1/auth/login", {
    body: JSON.stringify(payload),
    method: "POST",
  });

export const register = (
  payload: LoginRequest & { readonly displayName: string }
): Promise<AuthResultDto> =>
  apiFetch<AuthResultDto>("v1/auth/register", {
    body: JSON.stringify(payload),
    method: "POST",
  });

export const fetchProfile = (accessToken: string): Promise<AuthUserDto> =>
  apiFetch<AuthUserDto>("v1/auth/profile", {
    accessToken,
    method: "GET",
  });
