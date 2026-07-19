import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { requireSessionAccount } from "@/lib/server/auth";
import {
  mapAccount,
  normalizeAccountPreferences,
  query,
  toPublicAccount,
  type AccountPreferences,
} from "@/lib/server/db";

type PreferencesBody = Partial<AccountPreferences>;

export async function PATCH(request: Request) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  const body = await parseJson<PreferencesBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const preferences = normalizeAccountPreferences({
    ...session.account.preferences,
    ...body,
  });

  try {
    const result = await query(
      `UPDATE accounts
       SET preferences = $1::jsonb, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(preferences), session.account.id],
    );

    return NextResponse.json({ account: toPublicAccount(mapAccount(result.rows[0])) });
  } catch {
    return serverError();
  }
}
