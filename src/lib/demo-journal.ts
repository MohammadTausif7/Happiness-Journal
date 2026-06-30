export type JournalMood =
  | "happy"
  | "loved"
  | "calm"
  | "excited"
  | "surprised"
  | "sad"
  | "frustrated";

export type JournalEntry = {
  id: string;
  accountId: string;
  date: string;
  title: string;
  mood: JournalMood;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const moodOptions: Array<{
  id: JournalMood;
  emoji: string;
  label: string;
  className: string;
}> = [
  { id: "happy", emoji: "😊", label: "Happy", className: "sunny" },
  { id: "loved", emoji: "🥰", label: "Loved", className: "love" },
  { id: "calm", emoji: "😌", label: "Calm", className: "calm" },
  { id: "excited", emoji: "🤩", label: "Excited", className: "spark" },
  { id: "surprised", emoji: "😮", label: "Surprised", className: "surprise" },
  { id: "sad", emoji: "😔", label: "Sad", className: "rain" },
  { id: "frustrated", emoji: "😤", label: "Frustrated", className: "ember" },
];

const ENTRIES_KEY = "happiness-journal:entries";
const LAST_SYNC_KEY = "happiness-journal:last-sync";

function assertBrowserStorage() {
  if (typeof window === "undefined") {
    throw new Error("Demo journal storage is only available in the browser.");
  }
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

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getMoodMeta(mood: JournalMood) {
  return moodOptions.find((option) => option.id === mood) ?? moodOptions[0];
}

function shiftDate(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function createSeedEntries(accountId: string): JournalEntry[] {
  const today = new Date();
  const now = new Date().toISOString();
  const seed: Array<Pick<JournalEntry, "title" | "mood" | "notes"> & { offset: number }> = [
    {
      offset: -9,
      title: "Morning walk before work",
      mood: "happy",
      notes: "The neighborhood was quiet and the light made everything feel softer.",
    },
    {
      offset: -6,
      title: "Dinner with people I love",
      mood: "loved",
      notes: "A simple meal, lots of laughing, and one of those evenings I wanted to keep.",
    },
    {
      offset: -3,
      title: "A calm reset",
      mood: "calm",
      notes: "Cleaned my desk, answered a few messages, and gave myself permission to go slower.",
    },
    {
      offset: -1,
      title: "A heavy but honest day",
      mood: "sad",
      notes: "Not the easiest one, but writing it down made it feel less tangled.",
    },
    {
      offset: 0,
      title: "Portfolio progress",
      mood: "excited",
      notes: "The Happiness Journal dashboard is starting to feel like a real product.",
    },
  ];

  return seed.map((entry) => ({
    id: window.crypto.randomUUID(),
    accountId,
    date: formatDateKey(shiftDate(today, entry.offset)),
    title: entry.title,
    mood: entry.mood,
    notes: entry.notes,
    createdAt: now,
    updatedAt: now,
  }));
}

export function getAllJournalEntries() {
  return readJson<JournalEntry[]>(ENTRIES_KEY, []);
}

export function getJournalEntries(accountId: string) {
  return getAllJournalEntries()
    .filter((entry) => entry.accountId === accountId)
    .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt));
}

export function ensureJournalSeed(accountId: string) {
  const allEntries = getAllJournalEntries();

  if (allEntries.some((entry) => entry.accountId === accountId)) {
    return getJournalEntries(accountId);
  }

  const seededEntries = createSeedEntries(accountId);
  writeJson(ENTRIES_KEY, [...allEntries, ...seededEntries]);
  return getJournalEntries(accountId);
}

export function saveJournalEntry(input: {
  accountId: string;
  date: string;
  title: string;
  mood: JournalMood;
  notes: string;
}) {
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: window.crypto.randomUUID(),
    accountId: input.accountId,
    date: input.date,
    title: input.title.trim(),
    mood: input.mood,
    notes: input.notes.trim(),
    createdAt: now,
    updatedAt: now,
  };

  writeJson(ENTRIES_KEY, [...getAllJournalEntries(), entry]);
  setLastSyncAt(now, input.accountId);
  return entry;
}

export function getLastSyncAt(accountId: string) {
  const syncMap = readJson<Record<string, string>>(LAST_SYNC_KEY, {});
  return syncMap[accountId] ?? null;
}

export function setLastSyncAt(value: string, accountId?: string) {
  if (!accountId) {
    return;
  }

  const syncMap = readJson<Record<string, string>>(LAST_SYNC_KEY, {});
  writeJson(LAST_SYNC_KEY, { ...syncMap, [accountId]: value });
}

export function refreshJournalData(accountId: string) {
  const refreshedAt = new Date().toISOString();
  setLastSyncAt(refreshedAt, accountId);
  return {
    entries: getJournalEntries(accountId),
    refreshedAt,
  };
}
