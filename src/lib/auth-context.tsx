"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchProfile,
  login as loginRequest,
  register as registerRequest,
} from "./api/auth";

const ACCESS_TOKEN_KEY = "aipartner-access-token";

export type AuthState = {
  readonly accessToken?: string;
  readonly user?: {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
  };
  readonly status: "idle" | "loading" | "error" | "authenticated";
  readonly error?: string;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children }: { readonly children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({ status: "idle" });

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setState({ status: "idle" });
      return;
    }
    setState({ accessToken: token, status: "loading" });
    fetchProfile(token)
      .then((user) => {
        setState({ accessToken: token, status: "authenticated", user });
      })
      .catch(() => {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        setState({ status: "error", error: "登录已过期，请重新登录" });
      });
  }, []);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, status: "loading", error: undefined }));
      try {
        const result = await loginRequest({ email, password });
        window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
        setState({
          accessToken: result.accessToken,
          status: "authenticated",
          user: result.user,
        });
        if (pathname === "/login") {
          router.replace("/");
        }
      } catch (error) {
        setState({
          error: error instanceof Error ? error.message : "登录失败",
          status: "error",
        });
      }
    },
    [pathname, router]
  );

  const handleRegister = useCallback(
    async (displayName: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, status: "loading", error: undefined }));
      try {
        const result = await registerRequest({ displayName, email, password });
        window.localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
        setState({
          accessToken: result.accessToken,
          status: "authenticated",
          user: result.user,
        });
        router.replace("/");
      } catch (error) {
        setState({
          error: error instanceof Error ? error.message : "注册失败",
          status: "error",
        });
      }
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    setState({ status: "idle" });
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: handleLogin,
      logout: handleLogout,
      register: handleRegister,
    }),
    [handleLogin, handleLogout, handleRegister, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
