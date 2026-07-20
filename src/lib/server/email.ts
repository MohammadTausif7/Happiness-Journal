import nodemailer from "nodemailer";
import { getOptionalEnv, isProduction } from "@/lib/server/env";

type SendVerificationCodeInput = {
  to: string;
  code: string;
  purpose: "sign_up" | "sign_in";
};

export async function sendVerificationCode({ to, code, purpose }: SendVerificationCodeInput) {
  const from = getOptionalEnv("EMAIL_FROM");
  const host = getOptionalEnv("SMTP_HOST");
  const port = Number(getOptionalEnv("SMTP_PORT") || "465");
  const user = getOptionalEnv("SMTP_USER");
  const pass = getOptionalEnv("SMTP_PASS");
  const secure = getOptionalEnv("SMTP_SECURE") !== "false";

  if (!from || !host || !port || !user || !pass) {
    if (isProduction()) {
      throw new Error("SMTP email provider is not configured.");
    }

    return {
      sent: false,
      devCode: code,
    };
  }

  const subject = purpose === "sign_up"
    ? "Verify your Happiness Journal account"
    : "Your Happiness Journal sign-in code";

  const transporter = nodemailer.createTransport({
    auth: {
      pass,
      user,
    },
    host,
    port,
    secure,
  });

  await transporter.sendMail({
    from,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #27251f;">
        <h1 style="font-size: 28px;">Happiness Journal</h1>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 800; letter-spacing: 0.12em;">${code}</p>
        <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
    subject,
    text: `Your Happiness Journal verification code is ${code}. It expires in 10 minutes.`,
    to,
  });

  return {
    sent: true,
    devCode: undefined,
  };
}
