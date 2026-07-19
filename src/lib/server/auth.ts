import { cookies } from "next/headers";
import crypto from "node:crypto";
import { promisify } from "node:util";
import {
  mapAccount,
  normalizeEmail,
  query,
  rawQuery,
  toPublicAccount,
  type AccountPreferences,
  type PublicAccount,
  type ServerAccount,
} from "@/lib/server/db";
import { getAppUrl, isProduction, requireEnv } from "@/lib/server/env";

const scryptAsync = promisify(crypto.scrypt);
const SESSION_COOKIE = "hj_session";
const SESSION_TTL_DAYS = 30;
const VERIFICATION_TTL_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

export type SessionAccount = {
  account: PublicAccount;
  sessionId: string;
};

function getSecret() {
  return requireEnv("AUTH_SECRET");
}

function hashWithSecret(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createId() {
  return crypto.randomUUID();
}

export async function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64")) {
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return {
    salt,
    hash: hash.toString("base64"),
  };
}

export async function verifyPassword(password: string, account: Pick<ServerAccount, "passwordHash" | "passwordSalt">) {
  const { hash } = await hashPassword(password, account.passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(account.passwordHash));
}

export function createVerificationCode() {
  const value = crypto.randomInt(100000, 1000000);
  return String(value);
}

export function hashVerificationCode(email: string, purpose: string, code: string) {
  return hashWithSecret(`${normalizeEmail(email)}:${purpose}:${code}`);
}

export async function storeVerificationCode(input: {
  email: string;
  purpose: "sign_up" | "sign_in";
  code: string;
  accountId?: string;
  payload?: Record<string, unknown>;
}) {
  const email = normalizeEmail(input.email);
  await query(
    "DELETE FROM verification_codes WHERE email = $1 AND purpose = $2",
    [email, input.purpose],
  );
  await query(
    `INSERT INTO verification_codes
      (id, email, account_id, purpose, code_hash, payload, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW() + ($7 || ' minutes')::interval)`,
    [
      createId(),
      email,
      input.accountId ?? null,
      input.purpose,
      hashVerificationCode(email, input.purpose, input.code),
      JSON.stringify(input.payload ?? {}),
      VERIFICATION_TTL_MINUTES,
    ],
  );
}

export async function consumeVerificationCode(input: {
  email: string;
  purpose: "sign_up" | "sign_in";
  code: string;
}) {
  const email = normalizeEmail(input.email);
  const result = await query(
    `SELECT * FROM verification_codes
     WHERE email = $1 AND purpose = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [email, input.purpose],
  );
  const record = result.rows[0];

  if (!record) {
    return { ok: false as const, reason: "No verification code found." };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM verification_codes WHERE id = $1", [record.id]);
    return { ok: false as const, reason: "Verification code expired. Request a new code." };
  }

  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    await query("DELETE FROM verification_codes WHERE id = $1", [record.id]);
    return { ok: false as const, reason: "Too many attempts. Request a new code." };
  }

  const expectedHash = record.code_hash as string;
  const receivedHash = hashVerificationCode(email, input.purpose, input.code);
  const matches = crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(receivedHash));

  if (!matches) {
    await query("UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1", [record.id]);
    return { ok: false as const, reason: "Verification code does not match." };
  }

  await query("DELETE FROM verification_codes WHERE id = $1", [record.id]);

  return {
    ok: true as const,
    accountId: record.account_id as string | null,
    payload: (record.payload ?? {}) as Record<string, unknown>,
  };
}

export async function findAccountByEmail(email: string) {
  const result = await query("SELECT * FROM accounts WHERE email = $1", [normalizeEmail(email)]);
  return result.rows[0] ? mapAccount(result.rows[0]) : null;
}

export async function findAccountById(accountId: string) {
  const result = await query("SELECT * FROM accounts WHERE id = $1", [accountId]);
  return result.rows[0] ? mapAccount(result.rows[0]) : null;
}

export async function createAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  preferences: AccountPreferences;
}) {
  const result = await query(
    `INSERT INTO accounts
      (id, name, email, password_hash, password_salt, preferences, verified_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
     RETURNING *`,
    [
      createId(),
      input.name.trim(),
      normalizeEmail(input.email),
      input.passwordHash,
      input.passwordSalt,
      JSON.stringify(input.preferences),
    ],
  );
  return mapAccount(result.rows[0]);
}

export async function createSession(accountId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const sessionId = createId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO sessions (id, account_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, accountId, hashWithSecret(token), expiresAt.toISOString()],
  );

  return {
    token,
    sessionId,
    expiresAt,
  };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction() || getAppUrl().startsWith("https://"),
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await query("DELETE FROM sessions WHERE token_hash = $1", [hashWithSecret(token)]);
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction() || getAppUrl().startsWith("https://"),
    path: "/",
    expires: new Date(0),
  });
}

export async function getSessionAccount(): Promise<SessionAccount | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const result = await query(
    `SELECT sessions.id AS session_id, accounts.*
     FROM sessions
     JOIN accounts ON accounts.id = sessions.account_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()
     LIMIT 1`,
    [hashWithSecret(token)],
  );

  if (!result.rows[0]) {
    return null;
  }

  return {
    account: toPublicAccount(mapAccount(result.rows[0])),
    sessionId: result.rows[0].session_id,
  };
}

export async function requireSessionAccount() {
  const session = await getSessionAccount();

  if (!session) {
    return null;
  }

  return session;
}

export async function cleanupExpiredAuthRecords() {
  await rawQuery("DELETE FROM sessions WHERE expires_at <= NOW()");
  await rawQuery("DELETE FROM verification_codes WHERE expires_at <= NOW()");
}
