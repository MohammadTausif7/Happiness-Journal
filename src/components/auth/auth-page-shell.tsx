import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark, Wordmark } from "@/components/brand-mark";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  switchPrompt,
  switchHref,
  switchLabel,
}: AuthPageShellProps) {
  return (
    <main className="auth-page">
      <div aria-hidden="true" className="auth-orb auth-orb-one" />
      <div aria-hidden="true" className="auth-orb auth-orb-two" />

      <section className="auth-shell section-shell">
        <aside className="auth-story-card">
          <Link aria-label="Happiness Journal home" href="/">
            <Wordmark />
          </Link>
          <div className="auth-story-copy">
            <span className="section-kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="auth-preview-card">
            <div className="auth-preview-topline">
              <BrandMark size={30} />
              <span>Today&apos;s gentle check-in</span>
            </div>
            <div className="auth-preview-mood">
              <span>😊</span>
              <div>
                <strong>Feeling hopeful</strong>
                <p>Small wins, warm coffee, and a calmer evening.</p>
              </div>
            </div>
            <div className="auth-preview-calendar" aria-hidden="true">
              {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                <b key={day}>{day}</b>
              ))}
              {["", "😊", "", "🥰", "", "😌", "✨"].map((mood, index) => (
                <span className={mood ? "filled" : ""} key={`${mood}-${index}`}>
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-header">
            <BrandMark size={40} />
            <div>
              <span>{switchPrompt}</span>
              <Link href={switchHref}>{switchLabel}</Link>
            </div>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
