import { NextResponse } from "next/server";
import {
  createVerificationCode,
  findAccountByEmail,
  storeVerificationCode,
  verifyPassword,
} from "@/lib/server/auth";
import { badRequest, parseJson, serverError } from "@/lib/server/api";
import { normalizeEmail } from "@/lib/server/db";
import { sendVerificationCode } from "@/lib/server/email";

type SignInStartBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = await parseJson<SignInStartBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");

  if (!email || !password) {
    return badRequest("Email and password are required.");
  }

  try {
    const account = await findAccountByEmail(email);

    if (!account || !(await verifyPassword(password, account))) {
      return badRequest("We could not find an account with that email and password.");
    }

    const code = createVerificationCode();

    await storeVerificationCode({
      email,
      accountId: account.id,
      purpose: "sign_in",
      code,
    });

    const delivery = await sendVerificationCode({ to: email, code, purpose: "sign_in" });

    return NextResponse.json({
      message: delivery.sent ? "Two-factor code sent." : "Two-factor code ready.",
      devCode: delivery.devCode,
    });
  } catch (error) {
    return serverError(error, "auth.sign-in.start");
  }
}
