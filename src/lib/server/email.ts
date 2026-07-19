import { getOptionalEnv, isProduction } from "@/lib/server/env";

type SendVerificationCodeInput = {
  to: string;
  code: string;
  purpose: "sign_up" | "sign_in";
};

export async function sendVerificationCode({ to, code, purpose }: SendVerificationCodeInput) {
  const apiKey = getOptionalEnv("EMAIL_PROVIDER_API_KEY");
  const from = getOptionalEnv("EMAIL_FROM");

  if (!apiKey || !from) {
    if (isProduction()) {
      throw new Error("Email provider is not configured.");
    }

    return {
      sent: false,
      devCode: code,
    };
  }

  const subject = purpose === "sign_up"
    ? "Verify your Happiness Journal account"
    : "Your Happiness Journal sign-in code";

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      to,
      subject,
      text: `Your Happiness Journal verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #27251f;">
          <h1 style="font-size: 28px;">Happiness Journal</h1>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: 800; letter-spacing: 0.12em;">${code}</p>
          <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to send verification email.");
  }

  return {
    sent: true,
    devCode: undefined,
  };
}
