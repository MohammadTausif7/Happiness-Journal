import crypto from "node:crypto";
import { getOptionalEnv, requireEnv } from "@/lib/server/env";

type StripeCheckoutInput = {
  amount: number;
  currency: string;
  donorEmail?: string;
  note?: string;
  contributionId: string;
};

export async function createStripeCheckoutSession(input: StripeCheckoutInput) {
  const secretKey = requireEnv("STRIPE_SECRET_KEY");
  const successUrl = requireEnv("STRIPE_SUCCESS_URL");
  const cancelUrl = requireEnv("STRIPE_CANCEL_URL");
  const amountCents = Math.round(input.amount * 100);
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set("line_items[0][price_data][product_data][name]", "Happiness Journal contribution");
  params.set("metadata[contributionId]", input.contributionId);
  params.set("payment_intent_data[metadata][contributionId]", input.contributionId);

  if (input.donorEmail) {
    params.set("customer_email", input.donorEmail);
  }

  if (input.note) {
    params.set("metadata[note]", input.note);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    body: params,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  const result = await response.json() as { id?: string; url?: string; error?: { message?: string } };

  if (!response.ok || !result.id || !result.url) {
    throw new Error(result.error?.message ?? "Unable to create Stripe Checkout session.");
  }

  return {
    id: result.id,
    url: result.url,
  };
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const webhookSecret = getOptionalEnv("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
