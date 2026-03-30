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
  qwenApiKey: process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || "",
  qwenModel: process.env.QWEN_MODEL || "qwen3.5-plus",
  chatStreaming: process.env.CHAT_STREAMING !== "false",
  enableDashboardChat: process.env.ENABLE_DASHBOARD_CHAT !== "false",
  enablePaymentReceiptUpload: process.env.ENABLE_PAYMENT_RECEIPT_UPLOAD !== "false",
  enableUrlReferralCapture: process.env.ENABLE_URL_REFERRAL_CAPTURE !== "false",
  // Bank transfer details — general (HAMZURY LTD)
  bankName: process.env.BANK_NAME ?? "MONIEPOINT",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "8034620520",
  bankAccountName: process.env.BANK_ACCOUNT_NAME ?? "Hamzury Ltd.",
  // BizDoc-specific account (BIZDOC LTD)
  bizdocBankName: process.env.BIZDOC_BANK_NAME ?? "MONIEPOINT",
  bizdocBankAccountNumber: process.env.BIZDOC_BANK_ACCOUNT_NUMBER ?? "8067149356",
  bizdocBankAccountName: process.env.BIZDOC_BANK_ACCOUNT_NAME ?? "BIZDOC LTD",
};
