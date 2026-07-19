import { NextResponse } from "next/server";
import { isProduction } from "@/lib/server/env";

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message = "Please sign in first.") {
  return NextResponse.json({ message }, { status: 401 });
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

export function serverError(error?: unknown, context = "api") {
  if (error) {
    console.error(`[${context}]`, serializeError(error));
  }

  return NextResponse.json(
    {
      message: isProduction()
        ? "Something went wrong. Please try again."
        : error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    },
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
