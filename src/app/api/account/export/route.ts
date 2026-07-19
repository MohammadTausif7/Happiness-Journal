import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { requireSessionAccount } from "@/lib/server/auth";
import { mapProtectedJournalEntry, query } from "@/lib/server/db";

type ExportBody = {
  passphrase?: string;
};

async function deriveKey(passphrase: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, 210000, 32, "sha256", (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function POST(request: Request) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  const body = await parseJson<ExportBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const passphrase = String(body.passphrase ?? "");

  if (passphrase.length < 12) {
    return badRequest("Use an export passphrase with at least 12 characters.");
  }

  try {
    const entries = await query(
      "SELECT * FROM journal_entries WHERE account_id = $1 ORDER BY entry_date DESC, updated_at DESC",
      [session.account.id],
    );
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      account: session.account,
      entries: entries.rows.map(mapProtectedJournalEntry),
    });
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = await deriveKey(passphrase, salt);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return NextResponse.json({
      version: 1,
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA-256",
      iterations: 210000,
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      data: encrypted.toString("base64"),
    });
  } catch {
    return serverError();
  }
}
