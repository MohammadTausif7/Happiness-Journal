import { NextResponse } from "next/server";
import {
  consumeVerificationCode,
  createSession,
  findAccountByEmail,
  setSessionCookie,
} from "@/lib/server/auth";
import { badRequest, parseJson, serverError } from "@/lib/server/api";
import { normalizeEmail, toPublicAccount } from "@/lib/server/db";

type SignInVerifyBody = {
  email?: string;
  code?: string;
};

export async function POST(request: Request) {
  const body = await parseJson<SignInVerifyBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const email = normalizeEmail(String(body.email ?? ""));
  const code = String(body.code ?? "").trim();

  if (!email || !code) {
    return badRequest("Email and two-factor code are required.");
  }

  try {
    const verification = await consumeVerificationCode({ email, purpose: "sign_in", code });

    if (!verification.ok) {
      return badRequest(verification.reason);
    }

    const account = verification.accountId
      ? await findAccountByEmail(email)
      : null;

    if (!account) {
      return badRequest("Account not found. Please sign in again.");
    }

    const session = await createSession(account.id);
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({
      account: toPublicAccount(account),
    });
  } catch {
    return serverError();
  }
}
