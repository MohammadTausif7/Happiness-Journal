"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { clearSession, getSession } from "@/lib/demo-auth";
import type { DemoSession } from "@/lib/demo-auth";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const days = Array.from({ length: 35 }, (_, index) => index + 1);
const moodDays: Record<number, { emoji: string; className: string; title: string }> = {
  3: { emoji: "😊", className: "sunny", title: "Felt bright after a long walk" },
  8: { emoji: "🥰", className: "love", title: "Dinner with family" },
  14: { emoji: "😌", className: "calm", title: "A slow, peaceful morning" },
  19: { emoji: "😔", className: "rain", title: "Heavy day, wrote it out" },
  25: { emoji: "🤩", className: "spark", title: "Portfolio progress!" },
};

export function JournalDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSession(getSession());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleSignOut() {
    clearSession();
    router.push("/sign-in");
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
          <p>Your journal dashboard is connected to your local demo session for Increment 2.</p>
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
          <a href="#moments">Moments</a>
          <a href="#insights">Insights</a>
          <Link href="/sign-up">Invite flow</Link>
        </nav>

        <div className="sidebar-note">
          <span>Increment 2</span>
          <p>Auth, 2FA, and account session workflow are now testable locally.</p>
        </div>
      </aside>

      <section className="journal-workspace">
        <header className="journal-topbar">
          <div>
            <span className="section-kicker">YOUR PRIVATE SPACE</span>
            <h1>Welcome back, {session.name.split(" ")[0]}.</h1>
          </div>
          <div className="journal-actions">
            <button className="button button-secondary" type="button">
              + New
            </button>
            <button className="button button-dark" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-card calendar-card" id="calendar">
            <div className="dashboard-card-header">
              <div>
                <span className="section-kicker">MOOD CALENDAR</span>
                <h2>June 2026</h2>
              </div>
              <div className="view-switcher" aria-label="Calendar view options">
                <button className="active" type="button">Month</button>
                <button type="button">Week</button>
                <button type="button">Today</button>
              </div>
            </div>

            <div className="dashboard-calendar">
              {weekDays.map((day) => (
                <b key={day}>{day}</b>
              ))}
              {days.map((day) => {
                const mood = moodDays[day];
                return (
                  <article className={mood ? `dashboard-day ${mood.className}` : "dashboard-day"} key={day}>
                    <span>{day}</span>
                    {mood && (
                      <>
                        <strong title={mood.title}>{mood.emoji}</strong>
                        <i aria-hidden="true" />
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="dashboard-card today-card" id="moments">
            <span className="section-kicker">TODAY&apos;S PROMPT</span>
            <h2>What moment deserves to be remembered?</h2>
            <p>
              Increment 3 will connect this dashboard to saved journal entries and real calendar data.
            </p>
            <button className="button button-primary" type="button">
              Draft a moment
              <span aria-hidden="true">✎</span>
            </button>
          </section>

          <section className="dashboard-card account-card" id="insights">
            <span className="section-kicker">ACCOUNT SESSION</span>
            <h2>{session.email}</h2>
            <p>
              You are signed in through the local Increment 2 demo account workflow with email-style 2FA.
            </p>
            <ul>
              <li>Verified account session</li>
              <li>Password checked with SHA-256 hashing</li>
              <li>Ready for backend replacement later</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
