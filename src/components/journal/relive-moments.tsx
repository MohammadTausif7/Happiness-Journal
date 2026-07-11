"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { getAccountById, getSession } from "@/lib/demo-auth";
import { ensureJournalSeed, getMoodMeta, parseDateKey } from "@/lib/demo-journal";
import type { DemoSession } from "@/lib/demo-auth";
import type { JournalEntry } from "@/lib/demo-journal";

const fullDateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

function groupEntriesByMonth(entries: JournalEntry[]) {
  return entries.reduce<Array<{ key: string; label: string; entries: JournalEntry[] }>>((groups, entry) => {
    const date = parseDateKey(entry.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const existingGroup = groups.find((group) => group.key === key);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({
      key,
      label: monthFormatter.format(date),
      entries: [entry],
    });
    return groups;
  }, []);
}

function MoodScene({ emoji }: { emoji: string }) {
  return (
    <>
      <span className="scene-sun" />
      <span className="scene-emoji">{emoji}</span>
      <span className="scene-heart" />
      <span className="scene-heart two" />
      <span className="scene-heart three" />
      <span className="scene-star" />
      <span className="scene-star two" />
      <span className="scene-star three" />
      <span className="scene-surprise" />
      <span className="scene-surprise two" />
      <span className="scene-rain" />
      <span className="scene-rain deep" />
      <span className="scene-thunder">⚡</span>
      <span className="scene-thunder two">⚡</span>
      <span className="scene-cloud" />
      <span className="scene-cloud two" />
      <span className="scene-burst" />
      <span className="scene-burst two" />
      <span className="scene-ember" />
    </>
  );
}

function applyTheme(theme: string) {
  document.documentElement.dataset.accountTheme = theme;
}

export function ReliveMoments() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const currentSession = getSession();
        setSession(currentSession);

        if (currentSession) {
          const currentAccount = getAccountById(currentSession.accountId);
          setEntries(ensureJournalSeed(currentSession.accountId));

          if (currentAccount) {
            applyTheme(currentAccount.preferences.theme ?? "system");
          }
        }
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const groupedEntries = useMemo(() => groupEntriesByMonth(entries), [entries]);
  const selectedMood = selectedEntry ? getMoodMeta(selectedEntry.mood) : null;

  if (!isReady) {
    return (
      <main className="relive-page loading-page">
        <p>Gathering your moments...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relive-page empty-session-page">
        <section className="empty-session-card">
          <BrandMark size={46} />
          <h1>Please sign in first.</h1>
          <p>Your timeline is connected to your local Happiness Journal demo account.</p>
          <Link className="button button-primary" href="/sign-in">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relive-page">
      <header className="relive-hero">
        <Link aria-label="Back to journal dashboard" className="journal-brand" href="/journal">
          <BrandMark size={38} />
          <span>Happiness Journal</span>
        </Link>
        <div>
          <span className="section-kicker">RELIVE MOMENTS</span>
          <h1>Your days, arranged like a timeline.</h1>
          <p>
            Walk backward through saved journal events, then open any memory in a floating reader with its original mood.
          </p>
        </div>
        <Link className="button button-dark" href="/journal">
          Back to journal
        </Link>
      </header>

      <section className="timeline-shell" aria-label="Journal timeline">
        {groupedEntries.map((group) => (
          <div className="timeline-month" key={group.key}>
            <div className="timeline-month-label">
              <span>{group.label}</span>
            </div>
            <div className="timeline-list">
              {group.entries.map((entry) => {
                const mood = getMoodMeta(entry.mood);
                return (
                  <button className="timeline-entry" key={entry.id} onClick={() => setSelectedEntry(entry)} type="button">
                    <span className={`timeline-mood ${mood.className}`}>{mood.emoji}</span>
                    <span className="timeline-line" aria-hidden="true" />
                    <span className="timeline-copy">
                      <small>{fullDateFormatter.format(parseDateKey(entry.date))}</small>
                      <strong>{entry.title}</strong>
                      <em>{mood.label}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {selectedEntry && selectedMood && (
        <div aria-modal="true" className="relive-reader-overlay" role="dialog">
          <button
            aria-label="Close journal reader"
            className="editor-scrim"
            onClick={() => setSelectedEntry(null)}
            type="button"
          />

          <article className={`relive-reader-card ${selectedMood.className}`}>
            <div aria-hidden="true" className="relive-reader-atmosphere">
              <MoodScene emoji={selectedMood.emoji} />
            </div>
            <header>
              <span className="section-kicker">{selectedMood.label.toUpperCase()} MEMORY</span>
              <h2>{selectedEntry.title}</h2>
              <p>{fullDateFormatter.format(parseDateKey(selectedEntry.date))}</p>
            </header>
            <div className="relive-reader-body">
              <span className={`reader-mood-badge ${selectedMood.className}`}>{selectedMood.emoji}</span>
              <p>{selectedEntry.notes}</p>
            </div>
            <footer>
              <button className="button button-secondary" onClick={() => setSelectedEntry(null)} type="button">
                Close
              </button>
              <Link className="button button-primary" href="/journal">
                Open journal
              </Link>
            </footer>
          </article>
        </div>
      )}
    </main>
  );
}
