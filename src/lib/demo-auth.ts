export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  verifiedAt: string;
  updatedAt?: string;
  preferences: {
    twoFactorEmail: boolean;
    reminderEmails: boolean;
    theme?: AccountTheme;
    calendarDefaultView?: CalendarDefaultView;
    privateMoodStats?: boolean;
    encryptedExportsOnly?: boolean;
  };
};

export type DemoSession = {
  accountId: string;
  email: string;
  name: string;
  signedInAt: string;
};

export type AccountTheme = "system" | "light" | "sunset" | "calm" | "midnight";
export type CalendarDefaultView = "month" | "week" | "today";

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

function normalizeAccount(account: DemoAccount): DemoAccount {
  return {
    ...account,
    preferences: {
      twoFactorEmail: account.preferences?.twoFactorEmail ?? true,
      reminderEmails: account.preferences?.reminderEmails ?? true,
      theme: account.preferences?.theme ?? "system",
      calendarDefaultView: account.preferences?.calendarDefaultView ?? "month",
      privateMoodStats: account.preferences?.privateMoodStats ?? true,
      encryptedExportsOnly: account.preferences?.encryptedExportsOnly ?? true,
    },
  };
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
  return readJson<DemoAccount[]>(ACCOUNTS_KEY, []).map(normalizeAccount);
}

export function findAccountByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return getAccounts().find((account) => account.email === normalizedEmail) ?? null;
}

export function getAccountById(accountId: string) {
  return getAccounts().find((account) => account.id === accountId) ?? null;
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
      theme: "system",
      calendarDefaultView: "month",
      privateMoodStats: true,
      encryptedExportsOnly: true,
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

export function updateAccountProfile(input: {
  accountId: string;
  name: string;
  email: string;
}): DemoAccount | null {
  const email = normalizeEmail(input.email);
  const accounts = getAccounts();
  const existingEmailOwner = accounts.find((account) => account.email === email && account.id !== input.accountId);

  if (existingEmailOwner) {
    throw new Error("That email is already used by another account.");
  }

  let updatedAccount: DemoAccount | null = null;
  const updatedAccounts = accounts.map((account) => {
    if (account.id !== input.accountId) {
      return account;
    }

    updatedAccount = {
      ...account,
      name: input.name.trim(),
      email,
      updatedAt: new Date().toISOString(),
    };

    return updatedAccount;
  });

  writeJson(ACCOUNTS_KEY, updatedAccounts);

  if (updatedAccount) {
    saveSession(updatedAccount);
  }

  return updatedAccount;
}

export function updateAccountPreferences(
  accountId: string,
  preferences: Partial<DemoAccount["preferences"]>,
): DemoAccount | null {
  let updatedAccount: DemoAccount | null = null;
  const updatedAccounts = getAccounts().map((account) => {
    if (account.id !== accountId) {
      return account;
    }

    updatedAccount = {
      ...account,
      updatedAt: new Date().toISOString(),
      preferences: {
        ...account.preferences,
        ...preferences,
      },
    };

    return updatedAccount;
  });

  writeJson(ACCOUNTS_KEY, updatedAccounts);
  return updatedAccount;
}

export async function verifyAccountPassword(accountId: string, password: string) {
  const account = getAccountById(accountId);

  if (!account) {
    return false;
  }

  return account.passwordHash === (await hashPassword(password));
}

export function deleteAccount(accountId: string) {
  writeJson(
    ACCOUNTS_KEY,
    getAccounts().filter((account) => account.id !== accountId),
  );
  clearSession();
}
