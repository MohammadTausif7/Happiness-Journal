import { NextResponse } from "next/server";
import { createVerificationCode, findAccountByEmail, hashPassword, storeVerificationCode } from "@/lib/server/auth";
import { badRequest, parseJson, serverError } from "@/lib/server/api";
import { normalizeAccountPreferences, normalizeEmail } from "@/lib/server/db";
import { sendVerificationCode } from "@/lib/server/email";
import { isValidEmail, validatePassword } from "@/lib/server/validation";

type SignUpStartBody = {
  name?: string;
  email?: string;
  password?: string;
  reminderEmails?: boolean;
};

export async function POST(request: Request) {
  const body = await parseJson<SignUpStartBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const name = String(body.name ?? "").trim();
  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");

  if (name.length < 2) {
    return badRequest("Please enter your name.");
  }

  if (!isValidEmail(email)) {
    return badRequest("Please enter a valid email address.");
  }

  if (!validatePassword(password)) {
    return badRequest("Use at least 8 characters with a mix of uppercase letters, numbers, or symbols.");
  }

  try {
    if (await findAccountByEmail(email)) {
      return badRequest("An account already exists for this email.");
    }

    const passwordRecord = await hashPassword(password);
    const code = createVerificationCode();
    const preferences = normalizeAccountPreferences({
      reminderEmails: Boolean(body.reminderEmails),
    });

    await storeVerificationCode({
      email,
      purpose: "sign_up",
      code,
      payload: {
        name,
        email,
        passwordHash: passwordRecord.hash,
        passwordSalt: passwordRecord.salt,
        preferences,
      },
    });

    const delivery = await sendVerificationCode({ to: email, code, purpose: "sign_up" });

    return NextResponse.json({
      message: delivery.sent ? "Verification code sent." : "Verification code ready.",
      devCode: delivery.devCode,
    });
  } catch (error) {
    return serverError(error, "auth.sign-up.start");
  }
}
