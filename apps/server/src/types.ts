export type NodeEnv = "development" | "production" | "test";

export type AppConfig = {
  app: {
    port: number;
  };
  auth: {
    jwtExpiresIn: string;
    jwtSecret: string;
  };
  database: {
    url: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: NodeEnv;
  openai: {
    apiKey: string;
  };
};
