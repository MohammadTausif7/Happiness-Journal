export type ContributionCheckoutPayload = {
  amount: number;
  currency: string;
  donorEmail?: string;
  note?: string;
};

export const CONTRIBUTION_LIMITS = {
  minAmount: 1,
  maxAmount: 500,
  maxNoteLength: 220,
};

export function getMissingPaymentConfig() {
  const requiredKeys = [
    "PAYMENT_PROVIDER",
    "STRIPE_SECRET_KEY",
    "STRIPE_SUCCESS_URL",
    "STRIPE_CANCEL_URL",
  ];

  return requiredKeys.filter((key) => !process.env[key]);
}

export function validateContributionPayload(
  payload: Partial<ContributionCheckoutPayload>,
) {
  const errors: string[] = [];

  if (typeof payload.amount !== "number" || !Number.isFinite(payload.amount)) {
    errors.push("Contribution amount is required.");
  } else if (
    payload.amount < CONTRIBUTION_LIMITS.minAmount ||
    payload.amount > CONTRIBUTION_LIMITS.maxAmount
  ) {
    errors.push(
      `Contribution amount must be between $${CONTRIBUTION_LIMITS.minAmount} and $${CONTRIBUTION_LIMITS.maxAmount}.`,
    );
  }

  if (payload.currency?.toLowerCase() !== "usd") {
    errors.push("Only USD contributions are supported right now.");
  }

  if (payload.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.donorEmail)) {
    errors.push("Donor email must be a valid email address.");
  }

  if (payload.note && payload.note.length > CONTRIBUTION_LIMITS.maxNoteLength) {
    errors.push(`Note must be ${CONTRIBUTION_LIMITS.maxNoteLength} characters or fewer.`);
  }

  return errors;
}
