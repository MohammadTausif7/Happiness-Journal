import { NextResponse } from "next/server";
import { requireSessionAccount } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { serverError, unauthorized } from "@/lib/server/api";

export async function GET() {
  try {
    const session = await requireSessionAccount();

    if (!session) {
      return unauthorized();
    }

    const entries = await query(
      "SELECT COUNT(*)::int AS count, MAX(entry_date) AS latest_entry_date FROM journal_entries WHERE account_id = $1",
      [session.account.id],
    );

    return NextResponse.json({
      account: session.account,
      stats: {
        entryCount: entries.rows[0]?.count ?? 0,
        latestEntryDate: entries.rows[0]?.latest_entry_date ?? null,
      },
    });
  } catch {
    return serverError();
  }
}
