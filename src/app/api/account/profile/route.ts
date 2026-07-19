import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { requireSessionAccount } from "@/lib/server/auth";
import { mapAccount, normalizeEmail, query, toPublicAccount } from "@/lib/server/db";
import { isValidEmail, sanitizeText } from "@/lib/server/validation";

type ProfileBody = {
  name?: string;
  email?: string;
};

export async function PATCH(request: Request) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  const body = await parseJson<ProfileBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const name = sanitizeText(body.name, 120);
  const email = normalizeEmail(String(body.email ?? ""));

  if (name.length < 2) {
    return badRequest("Please enter a name with at least 2 characters.");
  }

  if (!isValidEmail(email)) {
    return badRequest("Please enter a valid email address.");
  }

  try {
    const duplicate = await query(
      "SELECT id FROM accounts WHERE email = $1 AND id <> $2",
      [email, session.account.id],
    );

    if (duplicate.rows[0]) {
      return badRequest("That email is already used by another account.");
    }

    const result = await query(
      `UPDATE accounts
       SET name = $1, email = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, email, session.account.id],
    );

    return NextResponse.json({ account: toPublicAccount(mapAccount(result.rows[0])) });
  } catch {
    return serverError();
  }
}
