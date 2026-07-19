import { NextResponse } from "next/server";
import { createId } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import {
  getMissingPaymentConfig,
  validateContributionPayload,
  type ContributionCheckoutPayload,
} from "@/lib/server/payment-config";
import { createStripeCheckoutSession } from "@/lib/server/stripe";

export async function POST(request: Request) {
  let payload: Partial<ContributionCheckoutPayload>;

  try {
    payload = (await request.json()) as Partial<ContributionCheckoutPayload>;
  } catch {
    return NextResponse.json(
      { message: "Checkout request must be valid JSON." },
      { status: 400 },
    );
  }

  const validationErrors = validateContributionPayload(payload);

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { message: validationErrors.join(" ") },
      { status: 400 },
    );
  }

  const missingConfig = getMissingPaymentConfig();

  if (missingConfig.length > 0) {
    return NextResponse.json(
      {
        code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
        message:
          "Secure contributions are not available yet. Please try again later.",
        missingConfig,
      },
      { status: 503 },
    );
  }

  try {
    const contributionId = createId();
    const amountCents = Math.round(Number(payload.amount) * 100);
    const session = await createStripeCheckoutSession({
      amount: Number(payload.amount),
      currency: String(payload.currency),
      donorEmail: payload.donorEmail,
      note: payload.note,
      contributionId,
    });

    await query(
      `INSERT INTO contributions
        (id, email, amount_cents, currency, stripe_session_id, status, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        contributionId,
        payload.donorEmail ?? null,
        amountCents,
        String(payload.currency).toLowerCase(),
        session.id,
        "checkout_created",
        payload.note ?? null,
      ],
    );

    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch {
    return NextResponse.json(
      { message: "Secure checkout could not be created. Please try again later." },
      { status: 502 },
    );
  }
}
