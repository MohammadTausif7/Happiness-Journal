import { NextResponse } from "next/server";
import { getMissingPaymentConfig } from "@/lib/server/payment-config";
import { isProduction } from "@/lib/server/env";
import { rawQuery } from "@/lib/server/db";

const productionKeys = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "AUTH_SECRET",
  "ENCRYPTION_KEY",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
];

export async function GET() {
  const missingCoreConfig = productionKeys.filter((key) => !process.env[key]);
  const missingPaymentConfig = getMissingPaymentConfig();
  const missingWebhookConfig = process.env.STRIPE_WEBHOOK_SECRET ? [] : ["STRIPE_WEBHOOK_SECRET"];
  const exposeDetails = !isProduction();
  let database = "not_checked";
  let databaseError = "";

  if (process.env.DATABASE_URL) {
    try {
      await rawQuery("SELECT 1");
      database = "connected";
    } catch (error) {
      database = "unavailable";
      databaseError = error instanceof Error ? error.message : String(error);
      console.error("[health.database]", error);
    }
  } else {
    database = "needs_configuration";
  }

  return NextResponse.json({
    app: "Happiness Journal",
    status: "ok",
    timestamp: new Date().toISOString(),
    readiness: {
      core: missingCoreConfig.length === 0 ? "configured" : "needs_configuration",
      database,
      payments: missingPaymentConfig.length === 0 ? "configured" : "needs_configuration",
      webhooks: missingWebhookConfig.length === 0 ? "configured" : "needs_configuration",
      ...(exposeDetails
        ? {
            missingCoreConfig,
            missingPaymentConfig,
            missingWebhookConfig,
            databaseError,
          }
        : {}),
    },
  });
}
