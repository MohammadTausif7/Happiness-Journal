import type { DemoAccount, DemoSession } from "@/lib/demo-auth";
import type { JournalEntry } from "@/lib/demo-journal";

type ApiResult<T> = T & {
  message?: string;
  devCode?: string;
};

export function useServerApiMode() {
  return process.env.NEXT_PUBLIC_DATA_MODE === "server";
}

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as ApiResult<T>;

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed. Please try again.");
  }

  return data;
}

function accountToSession(account: Omit<DemoAccount, "passwordHash">): DemoSession {
  return {
    accountId: account.id,
    email: account.email,
    name: account.name,
    signedInAt: new Date().toISOString(),
  };
}

export async function serverSignUpStart(input: {
  name: string;
  email: string;
  password: string;
  reminderEmails: boolean;
}) {
  return apiRequest<{ message: string; devCode?: string }>("/api/auth/sign-up/start", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function serverSignUpVerify(input: { email: string; code: string }) {
  const data = await apiRequest<{ account: Omit<DemoAccount, "passwordHash"> }>("/api/auth/sign-up/verify", {
    body: JSON.stringify(input),
    method: "POST",
  });

  return accountToSession(data.account);
}

export async function serverSignInStart(input: { email: string; password: string }) {
  return apiRequest<{ message: string; devCode?: string }>("/api/auth/sign-in/start", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function serverSignInVerify(input: { email: string; code: string }) {
  const data = await apiRequest<{ account: Omit<DemoAccount, "passwordHash"> }>("/api/auth/sign-in/verify", {
    body: JSON.stringify(input),
    method: "POST",
  });

  return accountToSession(data.account);
}

export async function serverGetSession() {
  const data = await apiRequest<{ account: Omit<DemoAccount, "passwordHash"> }>("/api/auth/session");
  return {
    session: accountToSession(data.account),
    account: data.account,
  };
}

export async function serverSignOut() {
  await apiRequest<{ ok: true }>("/api/auth/sign-out", { method: "POST" });
}

export async function serverGetJournalEntries() {
  return apiRequest<{ entries: JournalEntry[]; refreshedAt: string }>("/api/journal/entries");
}

export async function serverSaveJournalEntry(input: {
  date: string;
  title: string;
  mood: string;
  notes: string;
}) {
  const data = await apiRequest<{ entry: JournalEntry }>("/api/journal/entries", {
    body: JSON.stringify(input),
    method: "POST",
  });
  return data.entry;
}

export async function serverUpdateJournalEntry(input: {
  id: string;
  date: string;
  title: string;
  mood: string;
  notes: string;
}) {
  const data = await apiRequest<{ entry: JournalEntry }>(`/api/journal/entries/${input.id}`, {
    body: JSON.stringify(input),
    method: "PATCH",
  });
  return data.entry;
}

export async function serverGetAccount() {
  return apiRequest<{
    account: Omit<DemoAccount, "passwordHash">;
    stats: { entryCount: number; latestEntryDate: string | null };
  }>("/api/account");
}

export async function serverUpdateProfile(input: { name: string; email: string }) {
  const data = await apiRequest<{ account: Omit<DemoAccount, "passwordHash"> }>("/api/account/profile", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
  return data.account;
}

export async function serverUpdatePreferences(input: Partial<DemoAccount["preferences"]>) {
  const data = await apiRequest<{ account: Omit<DemoAccount, "passwordHash"> }>("/api/account/preferences", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
  return data.account;
}

export async function serverExportJournal(passphrase: string) {
  return apiRequest<Record<string, unknown>>("/api/account/export", {
    body: JSON.stringify({ passphrase }),
    method: "POST",
  });
}

export async function serverDeleteAccount(input: { password: string; confirmation: string }) {
  return apiRequest<{ ok: true }>("/api/account/delete", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
