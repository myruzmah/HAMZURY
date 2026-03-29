const DEV_FALLBACK_SECRET = "hamzury-dev-fallback-secret-do-not-use-in-production-2026";

// Fail fast in production if JWT_SECRET is missing
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET must be set in production");
}

export const ENV = {
  cookieSecret: process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? DEV_FALLBACK_SECRET : ""),
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  qwenApiKey: process.env.QWEN_API_KEY ?? "",
  // Bank transfer details (displayed to clients on invoices)
  bankName: process.env.BANK_NAME ?? "",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
  bankAccountName: process.env.BANK_ACCOUNT_NAME ?? "",
};
