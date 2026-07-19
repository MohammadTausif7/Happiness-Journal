import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { requireSessionAccount } from "@/lib/server/auth";
import { mapProtectedJournalEntry, query } from "@/lib/server/db";
import { encryptText } from "@/lib/server/encryption";
import { isJournalMood, sanitizeText, validateDateKey } from "@/lib/server/validation";

type EntryBody = {
  date?: string;
  title?: string;
  mood?: string;
  notes?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  const body = await parseJson<EntryBody>(request);

  if (!body) {
    return badRequest("Request body must be valid JSON.");
  }

  const date = String(body.date ?? "");
  const title = sanitizeText(body.title, 160);
  const mood = String(body.mood ?? "");
  const notes = sanitizeText(body.notes, 12000);

  if (!validateDateKey(date)) {
    return badRequest("Please choose a valid journal date.");
  }

  if (title.length < 3) {
    return badRequest("Add a short title so this moment is easier to find later.");
  }

  if (!isJournalMood(mood)) {
    return badRequest("Please choose a valid mood.");
  }

  if (notes.length < 6) {
    return badRequest("Write at least one sentence before saving the entry.");
  }

  try {
    const { id } = await context.params;
    const result = await query(
      `UPDATE journal_entries
       SET entry_date = $1, title = $2, mood = $3, notes = $4, updated_at = NOW()
       WHERE id = $5 AND account_id = $6
       RETURNING *`,
      [date, encryptText(title), mood, encryptText(notes), id, session.account.id],
    );

    if (!result.rows[0]) {
      return NextResponse.json({ message: "Journal entry not found." }, { status: 404 });
    }

    return NextResponse.json({ entry: mapProtectedJournalEntry(result.rows[0]) });
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  try {
    const { id } = await context.params;
    const result = await query(
      "DELETE FROM journal_entries WHERE id = $1 AND account_id = $2 RETURNING id",
      [id, session.account.id],
    );

    if (!result.rows[0]) {
      return NextResponse.json({ message: "Journal entry not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
