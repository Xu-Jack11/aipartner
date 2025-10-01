const missingRequired: string[] = [];

const nodeEnv = (process.env.NODE_ENV ?? "development") as
  | "development"
  | "production"
  | "test";

const trackMissing = (key: string) => {
  if (!missingRequired.includes(key)) {
    missingRequired.push(key);
  }
};

const readOptionalServerEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return;
  }
  return value;
};

const publicEnvVarKeys = {
  apiBaseUrl: "NEXT_PUBLIC_API_BASE_URL",
  appName: "NEXT_PUBLIC_APP_NAME",
  sentryDsn: "NEXT_PUBLIC_SENTRY_DSN",
  sentryEnvironment: "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
} as const;

type PublicEnvKey = keyof typeof publicEnvVarKeys;

const rawPublicEnv: Record<PublicEnvKey, string | undefined> = {
  apiBaseUrl: process.env[publicEnvVarKeys.apiBaseUrl],
  appName: process.env[publicEnvVarKeys.appName],
  sentryDsn: process.env[publicEnvVarKeys.sentryDsn],
  sentryEnvironment: process.env[publicEnvVarKeys.sentryEnvironment],
};

const readRequiredPublicEnv = <Key extends PublicEnvKey>(
  key: Key,
  fallback?: string
): string => {
  const value = rawPublicEnv[key];
  if (value === undefined || value === "") {
    if (fallback !== undefined && nodeEnv !== "production") {
      return fallback;
    }
    trackMissing(publicEnvVarKeys[key]);
    return fallback ?? "";
  }
  return value;
};

const readOptionalPublicEnv = <Key extends PublicEnvKey>(
  key: Key
): string | undefined => {
  const value = rawPublicEnv[key];
  if (value === undefined || value === "") {
    return;
  }
  return value;
};

export const env = {
  nodeEnv,
  isDevelopment: nodeEnv === "development",
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  public: {
    apiBaseUrl: readRequiredPublicEnv("apiBaseUrl", "http://localhost:3001"),
    appName: readRequiredPublicEnv("appName", "AI Study Companion"),
    sentryDsn: readOptionalPublicEnv("sentryDsn"),
    sentryEnvironment: readOptionalPublicEnv("sentryEnvironment") ?? nodeEnv,
  },
  server: {
    aiProviderApiKey: readOptionalServerEnv("AI_PROVIDER_API_KEY"),
    databaseUrl: readOptionalServerEnv("DATABASE_URL"),
    mongoDbUri: readOptionalServerEnv("MONGODB_URI"),
    vectorDbUrl: readOptionalServerEnv("VECTOR_DB_URL"),
    storageBucketUrl: readOptionalServerEnv("STORAGE_BUCKET_URL"),
  },
} as const;

if (env.isProduction && missingRequired.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingRequired.join(", ")}`
  );
}
