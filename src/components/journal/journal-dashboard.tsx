"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { clearSession, getSession } from "@/lib/demo-auth";
import {
  ensureJournalSeed,
  formatDateKey,
  getJournalEntries,
  getLastSyncAt,
  getMoodMeta,
  moodOptions,
  parseDateKey,
  refreshJournalData,
  saveJournalEntry,
} from "@/lib/demo-journal";
import type { DemoSession } from "@/lib/demo-auth";
import type { JournalEntry, JournalMood } from "@/lib/demo-journal";

type CalendarView = "month" | "week" | "today";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const selectedDateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function getMondayFirstDay(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getMonthGrid(anchorDate: Date) {
  const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const startDate = addDays(firstOfMonth, -getMondayFirstDay(firstOfMonth));

  return Array.from({ length: 42 }, (_, index) => addDays(startDate, index));
}

function getWeekGrid(anchorDate: Date) {
  const startDate = addDays(anchorDate, -getMondayFirstDay(anchorDate));
  return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
}

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(parseDateKey(dateKey));
}

function getEntriesByDate(entries: JournalEntry[]) {
  return entries.reduce<Record<string, JournalEntry[]>>((groupedEntries, entry) => {
    groupedEntries[entry.date] = [...(groupedEntries[entry.date] ?? []), entry];
    return groupedEntries;
  }, {});
}

function getMonthEntryCount(entries: JournalEntry[], anchorDate: Date) {
  return entries.filter((entry) => {
    const entryDate = parseDateKey(entry.date);
    return entryDate.getFullYear() === anchorDate.getFullYear() && entryDate.getMonth() === anchorDate.getMonth();
  }).length;
}

function getCurrentStreak(entries: JournalEntry[]) {
  const entryDates = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  let cursor = new Date();

  while (entryDates.has(formatDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function getFavoriteMood(entries: JournalEntry[]) {
  const moodCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    return counts;
  }, {});

  const favoriteMood = Object.entries(moodCounts).sort((first, second) => second[1] - first[1])[0]?.[0] as
    | JournalMood
    | undefined;

  return favoriteMood ? getMoodMeta(favoriteMood) : null;
}

export function JournalDashboard() {
  const router = useRouter();
  const todayKey = formatDateKey(new Date());
  const [session, setSession] = useState<DemoSession | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMood, setDraftMood] = useState<JournalMood>("happy");
  const [draftNotes, setDraftNotes] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentSession = getSession();
      setSession(currentSession);

      if (currentSession) {
        setEntries(ensureJournalSeed(currentSession.accountId));
        setLastSyncedAt(getLastSyncAt(currentSession.accountId));
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const anchorDate = parseDateKey(selectedDate);
  const entriesByDate = useMemo(() => getEntriesByDate(entries), [entries]);
  const selectedEntries = entriesByDate[selectedDate] ?? [];
  const visibleDates =
    calendarView === "month" ? getMonthGrid(anchorDate) : calendarView === "week" ? getWeekGrid(anchorDate) : [anchorDate];
  const monthEntryCount = getMonthEntryCount(entries, anchorDate);
  const currentStreak = getCurrentStreak(entries);
  const favoriteMood = getFavoriteMood(entries);
  const recentEntries = entries.slice(0, 4);

  function handleSignOut() {
    clearSession();
    router.push("/sign-in");
  }

  function handleRefresh() {
    if (!session) {
      return;
    }

    const result = refreshJournalData(session.accountId);
    setEntries(result.entries);
    setLastSyncedAt(result.refreshedAt);
    setFormMessage("Calendar refreshed with your latest local journal data.");
  }

  function handleSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    if (draftTitle.trim().length < 3) {
      setFormMessage("Give this moment a short title before saving.");
      return;
    }

    saveJournalEntry({
      accountId: session.accountId,
      date: selectedDate,
      title: draftTitle,
      mood: draftMood,
      notes: draftNotes || "Saved from the Increment 3 quick capture panel.",
    });

    setEntries(getJournalEntries(session.accountId));
    setLastSyncedAt(new Date().toISOString());
    setDraftTitle("");
    setDraftNotes("");
    setDraftMood("happy");
    setFormMessage("Moment saved. Your calendar updated right away.");
  }

  if (!isReady) {
    return (
      <main className="journal-page loading-page">
        <p>Opening your journal...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="journal-page empty-session-page">
        <section className="empty-session-card">
          <BrandMark size={46} />
          <h1>Please sign in first.</h1>
          <p>Your journal dashboard is connected to your local demo session for Increment 3.</p>
          <Link className="button button-primary" href="/sign-in">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="journal-page">
      <aside className="journal-sidebar">
        <Link aria-label="Happiness Journal home" className="journal-brand" href="/">
          <BrandMark size={38} />
          <span>Happiness Journal</span>
        </Link>

        <nav aria-label="Journal navigation" className="journal-nav">
          <a className="active" href="#calendar">Calendar</a>
          <a href="#selected-day">Selected day</a>
          <a href="#quick-capture">Quick capture</a>
          <a href="#insights">Insights</a>
        </nav>

        <div className="sidebar-note">
          <span>Increment 3</span>
          <p>Calendar views, local journal retrieval, daily details, and dashboard stats are now live.</p>
        </div>
      </aside>

      <section className="journal-workspace">
        <header className="journal-topbar">
          <div>
            <span className="section-kicker">YOUR PRIVATE SPACE</span>
            <h1>Welcome back, {session.name.split(" ")[0]}.</h1>
            <p>
              {lastSyncedAt
                ? `Last refreshed ${new Intl.DateTimeFormat("en", {
                    hour: "numeric",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(lastSyncedAt))}`
                : "Local journal data is ready to review."}
            </p>
          </div>
          <div className="journal-actions">
            <button className="button button-secondary" onClick={handleRefresh} type="button">
              Refresh data
            </button>
            <button className="button button-dark" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </header>

        <section aria-label="Journal summary" className="journal-stat-grid">
          <article>
            <span>{monthEntryCount}</span>
            <p>entries this month</p>
          </article>
          <article>
            <span>{currentStreak}</span>
            <p>day current streak</p>
          </article>
          <article>
            <span>{favoriteMood ? favoriteMood.emoji : "—"}</span>
            <p>{favoriteMood ? `${favoriteMood.label} appears most` : "favorite mood pending"}</p>
          </article>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-card calendar-card" id="calendar">
            <div className="dashboard-card-header">
              <div>
                <span className="section-kicker">MOOD CALENDAR</span>
                <h2>{dateFormatter.format(anchorDate)}</h2>
              </div>
              <div className="view-switcher" aria-label="Calendar view options">
                {(["month", "week", "today"] as CalendarView[]).map((view) => (
                  <button
                    className={calendarView === view ? "active" : ""}
                    key={view}
                    onClick={() => setCalendarView(view)}
                    type="button"
                  >
                    {view[0].toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={`dashboard-calendar ${calendarView}`}>
              {calendarView !== "today" &&
                weekDays.map((day) => (
                  <b key={day}>{day}</b>
                ))}
              {visibleDates.map((date) => {
                const dateKey = formatDateKey(date);
                const dayEntries = entriesByDate[dateKey] ?? [];
                const primaryEntry = dayEntries[0];
                const mood = primaryEntry ? getMoodMeta(primaryEntry.mood) : null;
                const isSelected = selectedDate === dateKey;
                const isMuted = calendarView === "month" && date.getMonth() !== anchorDate.getMonth();

                return (
                  <button
                    aria-label={`${selectedDateFormatter.format(date)}${primaryEntry ? `, ${mood?.label}` : ""}`}
                    className={[
                      "dashboard-day",
                      mood?.className,
                      isSelected ? "selected" : "",
                      isMuted ? "muted-month" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    type="button"
                  >
                    <span>{date.getDate()}</span>
                    {mood && (
                      <>
                        <strong title={primaryEntry.title}>{mood.emoji}</strong>
                        <small>{dayEntries.length}</small>
                        <i aria-hidden="true" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="dashboard-card selected-day-card" id="selected-day">
            <span className="section-kicker">SELECTED DAY</span>
            <h2>{selectedDateFormatter.format(anchorDate)}</h2>
            <div className="selected-entry-list">
              {selectedEntries.length > 0 ? (
                selectedEntries.map((entry) => {
                  const mood = getMoodMeta(entry.mood);
                  return (
                    <article key={entry.id}>
                      <span className={`entry-mood-dot ${mood.className}`}>{mood.emoji}</span>
                      <div>
                        <strong>{entry.title}</strong>
                        <p>{entry.notes}</p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="empty-day-message">No moment saved for this day yet. Add one with quick capture.</p>
              )}
            </div>
          </section>

          <section className="dashboard-card capture-card" id="quick-capture">
            <span className="section-kicker">QUICK CAPTURE</span>
            <h2>Log a small moment.</h2>
            <form className="capture-form" onSubmit={handleSaveEntry}>
              <label>
                Date
                <input onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
              </label>
              <label>
                Title
                <input
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="What happened?"
                  type="text"
                  value={draftTitle}
                />
              </label>
              <div className="capture-mood-row" role="radiogroup" aria-label="Mood">
                {moodOptions.map((mood) => (
                  <button
                    aria-checked={draftMood === mood.id}
                    className={draftMood === mood.id ? "active" : ""}
                    key={mood.id}
                    onClick={() => setDraftMood(mood.id)}
                    role="radio"
                    type="button"
                  >
                    <span>{mood.emoji}</span>
                    <small>{mood.label}</small>
                  </button>
                ))}
              </div>
              <label>
                Notes
                <textarea
                  onChange={(event) => setDraftNotes(event.target.value)}
                  placeholder="A sentence is enough."
                  rows={3}
                  value={draftNotes}
                />
              </label>
              {formMessage && <p className="form-message success">{formMessage}</p>}
              <button className="button button-primary full-button" type="submit">
                Save to calendar
                <span aria-hidden="true">✎</span>
              </button>
            </form>
          </section>

          <section className="dashboard-card account-card" id="insights">
            <span className="section-kicker">RECENT MOMENTS</span>
            <h2>Latest entries</h2>
            <div className="recent-entry-list">
              {recentEntries.map((entry) => {
                const mood = getMoodMeta(entry.mood);
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedDate(entry.date);
                      setCalendarView("week");
                    }}
                    type="button"
                  >
                    <span>{mood.emoji}</span>
                    <div>
                      <strong>{entry.title}</strong>
                      <small>{formatShortDate(entry.date)}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
