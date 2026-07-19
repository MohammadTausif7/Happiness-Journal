import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { clearSessionCookie, findAccountById, requireSessionAccount, verifyPassword } from "@/lib/server/auth";
import { query } from "@/lib/server/db";

type DeleteBody = {
  password?: string;
  confirmation?: string;
};

export async function POST(request: Request) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  const body = await parseJson<DeleteBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  if (body.confirmation !== "DELETE") {
    return badRequest("Type DELETE to confirm account deletion.");
  }

  try {
    const account = await findAccountById(session.account.id);

    if (!account || !(await verifyPassword(String(body.password ?? ""), account))) {
      return badRequest("Password confirmation failed.");
    }

    await query("DELETE FROM accounts WHERE id = $1", [session.account.id]);
    await clearSessionCookie();

    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
