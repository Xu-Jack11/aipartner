import type { AppConfig, NodeEnv } from "../types";

export const DEFAULT_APP_PORT = 4000;

const missingRequired: string[] = [];

const resolveNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }
  return "development";
};

const nodeEnv = resolveNodeEnv(process.env.NODE_ENV);
const isDevelopment = nodeEnv === "development";
const isProduction = nodeEnv === "production";
const isTest = nodeEnv === "test";

const trackMissing = (key: string) => {
  if (!missingRequired.includes(key)) {
    missingRequired.push(key);
  }
};

const readRequired = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (fallback !== undefined && !isProduction) {
      return fallback;
    }
    trackMissing(key);
    return fallback ?? "";
  }
  return value;
};

const readNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid integer.`);
  }
  return parsed;
};

const appPort = readNumber("PORT", DEFAULT_APP_PORT);
const jwtSecret = readRequired("JWT_SECRET", "local-development-secret");
const jwtExpiresIn = readRequired("JWT_EXPIRES_IN", "1h");

if (isProduction && missingRequired.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingRequired.join(", ")}`
  );
}

export const env: AppConfig = Object.freeze({
  app: {
    port: appPort,
  },
  auth: {
    jwtExpiresIn,
    jwtSecret,
  },
  isDevelopment,
  isProduction,
  isTest,
  nodeEnv,
});
