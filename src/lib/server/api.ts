import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message = "Please sign in first.") {
  return NextResponse.json({ message }, { status: 401 });
}

export function serverError() {
  return NextResponse.json(
    { message: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
