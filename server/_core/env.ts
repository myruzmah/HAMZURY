const DEV_FALLBACK_SECRET = "hamzury-dev-fallback-secret-do-not-use-in-production-2026";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "hamzury-dev",
  cookieSecret: process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? DEV_FALLBACK_SECRET : ""),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  qwenApiKey: process.env.QWEN_API_KEY ?? "",
};
