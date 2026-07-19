import { NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/server/auth";
import { serverError } from "@/lib/server/api";

export async function GET() {
  try {
    const session = await getSessionAccount();

    if (!session) {
      return NextResponse.json({ account: null }, { status: 401 });
    }

    return NextResponse.json({ account: session.account });
  } catch {
    return serverError();
  }
}
