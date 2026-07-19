import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";
import { serverError } from "@/lib/server/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
