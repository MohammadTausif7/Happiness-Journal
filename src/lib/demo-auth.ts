export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  verifiedAt: string;
  preferences: {
    twoFactorEmail: boolean;
    reminderEmails: boolean;
  };
};

export type DemoSession = {
  accountId: string;
  email: string;
  name: string;
  signedInAt: string;
};

const ACCOUNTS_KEY = "happiness-journal:accounts";
const SESSION_KEY = "happiness-journal:session";

function assertBrowserStorage() {
  if (typeof window === "undefined") {
    throw new Error("Demo auth storage is only available in the browser.");
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  assertBrowserStorage();

  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  assertBrowserStorage();
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const digest = await window.crypto.subtle.digest("SHA-256", encoder.encode(password));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createVerificationCode() {
  const digits = new Uint32Array(1);
  window.crypto.getRandomValues(digits);
  return String(100000 + (digits[0] % 900000));
}

export function getAccounts() {
  return readJson<DemoAccount[]>(ACCOUNTS_KEY, []);
}

export function findAccountByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getAccounts().find((account) => account.email === normalizedEmail) ?? null;
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  reminderEmails: boolean;
}) {
  const accounts = getAccounts();
  const email = normalizeEmail(input.email);

  if (accounts.some((account) => account.email === email)) {
    throw new Error("An account already exists for this email.");
  }

  const now = new Date().toISOString();
  const account: DemoAccount = {
    id: window.crypto.randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    verifiedAt: now,
    preferences: {
      twoFactorEmail: true,
      reminderEmails: input.reminderEmails,
    },
  };

  writeJson(ACCOUNTS_KEY, [...accounts, account]);
  return account;
}

export async function verifyCredentials(email: string, password: string) {
  const account = findAccountByEmail(email);

  if (!account) {
    return null;
  }

  const passwordHash = await hashPassword(password);
  return account.passwordHash === passwordHash ? account : null;
}

export function saveSession(account: DemoAccount) {
  const session: DemoSession = {
    accountId: account.id,
    email: account.email,
    name: account.name,
    signedInAt: new Date().toISOString(),
  };

  writeJson(SESSION_KEY, session);
  return session;
}

export function getSession() {
  return readJson<DemoSession | null>(SESSION_KEY, null);
}

export function clearSession() {
  assertBrowserStorage();
  window.localStorage.removeItem(SESSION_KEY);
}
