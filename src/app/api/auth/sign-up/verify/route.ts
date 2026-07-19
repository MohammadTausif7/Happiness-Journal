import { NextResponse } from "next/server";
import {
  consumeVerificationCode,
  createAccount,
  createSession,
  findAccountByEmail,
  setSessionCookie,
} from "@/lib/server/auth";
import { badRequest, parseJson, serverError } from "@/lib/server/api";
import { normalizeAccountPreferences, normalizeEmail, toPublicAccount, type AccountPreferences } from "@/lib/server/db";

type SignUpVerifyBody = {
  email?: string;
  code?: string;
};

export async function POST(request: Request) {
  const body = await parseJson<SignUpVerifyBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const email = normalizeEmail(String(body.email ?? ""));
  const code = String(body.code ?? "").trim();

  if (!email || !code) {
    return badRequest("Email and verification code are required.");
  }

  try {
    if (await findAccountByEmail(email)) {
      return badRequest("An account already exists for this email.");
    }

    const verification = await consumeVerificationCode({ email, purpose: "sign_up", code });

    if (!verification.ok) {
      return badRequest(verification.reason);
    }

    const payload = verification.payload;
    const account = await createAccount({
      name: String(payload.name ?? ""),
      email,
      passwordHash: String(payload.passwordHash ?? ""),
      passwordSalt: String(payload.passwordSalt ?? ""),
      preferences: normalizeAccountPreferences(payload.preferences as Partial<AccountPreferences>),
    });
    const session = await createSession(account.id);

    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({
      account: toPublicAccount(account),
    });
  } catch {
    return serverError();
  }
}
