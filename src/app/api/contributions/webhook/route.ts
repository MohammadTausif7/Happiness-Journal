import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { verifyStripeWebhookSignature } from "@/lib/server/stripe";

type StripeEvent = {
  type?: string;
  data?: {
    object?: {
      id?: string;
      metadata?: {
        contributionId?: string;
      };
      payment_status?: string;
    };
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(payload, signature)) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const checkoutSession = event.data?.object;
  const contributionId = checkoutSession?.metadata?.contributionId;

  if (event.type === "checkout.session.completed" && contributionId) {
    await query(
      `UPDATE contributions
       SET status = $1, updated_at = NOW()
       WHERE id = $2 OR stripe_session_id = $3`,
      [checkoutSession?.payment_status === "paid" ? "paid" : "completed", contributionId, checkoutSession?.id ?? ""],
    );
  }

  return NextResponse.json({ received: true });
}
