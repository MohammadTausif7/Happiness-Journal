import { NextResponse } from "next/server";
import {
  getMissingPaymentConfig,
  validateContributionPayload,
  type ContributionCheckoutPayload,
} from "@/lib/server/payment-config";

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

  // Final-increment handoff:
  // Create a provider checkout session here using server-only secrets, then
  // return the provider-hosted checkout URL. The UI already expects that shape.
  return NextResponse.json(
    {
      message:
        "Secure checkout is being prepared. Please try again later.",
    },
    { status: 501 },
  );
}
