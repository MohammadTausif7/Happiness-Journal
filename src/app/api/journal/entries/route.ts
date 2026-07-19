import { NextResponse } from "next/server";
import { badRequest, parseJson, serverError, unauthorized } from "@/lib/server/api";
import { createId, requireSessionAccount } from "@/lib/server/auth";
import { mapProtectedJournalEntry, query } from "@/lib/server/db";
import { encryptText } from "@/lib/server/encryption";
import { isJournalMood, sanitizeText, validateDateKey } from "@/lib/server/validation";

type EntryBody = {
  date?: string;
  title?: string;
  mood?: string;
  notes?: string;
};

export async function GET() {
  const session = await requireSessionAccount();

  if (!session) {
    return unauthorized();
  }

  try {
    const result = await query(
      "SELECT * FROM journal_entries WHERE account_id = $1 ORDER BY entry_date DESC, updated_at DESC",
      [session.account.id],
    );

    return NextResponse.json({
      entries: result.rows.map(mapProtectedJournalEntry),
      refreshedAt: new Date().toISOString(),
    });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
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
    const result = await query(
      `INSERT INTO journal_entries
        (id, account_id, entry_date, title, mood, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [createId(), session.account.id, date, encryptText(title), mood, encryptText(notes)],
    );

    return NextResponse.json({ entry: mapProtectedJournalEntry(result.rows[0]) }, { status: 201 });
  } catch {
    return serverError();
  }
}
