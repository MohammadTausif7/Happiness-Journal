import { Pool, type QueryResultRow } from "pg";
import type { AccountTheme, CalendarDefaultView } from "@/lib/demo-auth";
import type { JournalEntry, JournalMood } from "@/lib/demo-journal";
import { decryptText } from "@/lib/server/encryption";
import { requireEnv } from "@/lib/server/env";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export type AccountPreferences = {
  twoFactorEmail: boolean;
  reminderEmails: boolean;
  theme: AccountTheme;
  calendarDefaultView: CalendarDefaultView;
  privateMoodStats: boolean;
  encryptedExportsOnly: boolean;
};

export type ServerAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  verifiedAt: string;
  updatedAt?: string;
  preferences: AccountPreferences;
};

export type PublicAccount = Omit<ServerAccount, "passwordHash" | "passwordSalt">;

const defaultPreferences: AccountPreferences = {
  twoFactorEmail: true,
  reminderEmails: true,
  theme: "system",
  calendarDefaultView: "month",
  privateMoodStats: true,
  encryptedExportsOnly: true,
};

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: requireEnv("DATABASE_URL"),
      max: 5,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

function normalizePreferences(value: unknown): AccountPreferences {
  const preferences = typeof value === "object" && value ? value as Partial<AccountPreferences> : {};

  return {
    ...defaultPreferences,
    ...preferences,
  };
}

export function toPublicAccount(account: ServerAccount): PublicAccount {
  const publicAccount = {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
    verifiedAt: account.verifiedAt,
    updatedAt: account.updatedAt,
    preferences: account.preferences,
  };
  return publicAccount;
}

export function mapAccount(row: QueryResultRow): ServerAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: new Date(row.created_at).toISOString(),
    verifiedAt: new Date(row.verified_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    preferences: normalizePreferences(row.preferences),
  };
}

export function mapJournalEntry(row: QueryResultRow): JournalEntry {
  return {
    id: row.id,
    accountId: row.account_id,
    date: row.entry_date,
    title: row.title,
    mood: row.mood as JournalMood,
    notes: row.notes,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function mapProtectedJournalEntry(row: QueryResultRow): JournalEntry {
  return {
    ...mapJournalEntry(row),
    title: decryptText(row.title),
    notes: decryptText(row.notes),
  };
}

async function ensureSchemaInternal() {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      payload JSONB,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL,
      title TEXT NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      email TEXT,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      stripe_session_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'created',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query("CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions(account_id)");
  await db.query("CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)");
  await db.query("CREATE INDEX IF NOT EXISTS verification_codes_email_idx ON verification_codes(email, purpose)");
  await db.query("CREATE INDEX IF NOT EXISTS journal_entries_account_date_idx ON journal_entries(account_id, entry_date)");
}

export async function ensureSchema() {
  schemaReady ??= ensureSchemaInternal();
  return schemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {
  await ensureSchema();
  return getPool().query<T>(sql, values);
}

export async function rawQuery<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {
  return getPool().query<T>(sql, values);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeAccountPreferences(preferences: Partial<AccountPreferences>) {
  return normalizePreferences(preferences);
}
