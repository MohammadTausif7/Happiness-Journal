import { NextResponse } from "next/server";
import { getMissingPaymentConfig } from "@/lib/server/payment-config";
import { isProduction } from "@/lib/server/env";

const productionKeys = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "AUTH_SECRET",
  "ENCRYPTION_KEY",
  "EMAIL_FROM",
  "EMAIL_PROVIDER_API_KEY",
];

export function GET() {
  const missingCoreConfig = productionKeys.filter((key) => !process.env[key]);
  const missingPaymentConfig = getMissingPaymentConfig();
  const missingWebhookConfig = process.env.STRIPE_WEBHOOK_SECRET ? [] : ["STRIPE_WEBHOOK_SECRET"];
  const exposeDetails = !isProduction();

  return NextResponse.json({
    app: "Happiness Journal",
    status: "ok",
    timestamp: new Date().toISOString(),
    readiness: {
      core: missingCoreConfig.length === 0 ? "configured" : "needs_configuration",
      payments: missingPaymentConfig.length === 0 ? "configured" : "needs_configuration",
      webhooks: missingWebhookConfig.length === 0 ? "configured" : "needs_configuration",
      ...(exposeDetails
        ? {
            missingCoreConfig,
            missingPaymentConfig,
            missingWebhookConfig,
          }
        : {}),
    },
  });
}
