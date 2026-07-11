import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/brand-mark";
import { ContributionForm } from "@/components/contributions/contribution-form";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Support Happiness Journal with a secure one-time contribution.",
};

const trustPoints = [
  "One-time contributions only",
  "No journal data is sent to the payment provider",
  "Secure checkout keeps payment details separate from your journal",
];

export default function ContributePage() {
  return (
    <main className="contribution-page">
      <div aria-hidden="true" className="contribution-orb contribution-orb-one" />
      <div aria-hidden="true" className="contribution-orb contribution-orb-two" />

      <section className="contribution-shell section-shell">
        <header className="contribution-hero">
          <Link aria-label="Happiness Journal home" href="/">
            <Wordmark />
          </Link>
          <Link className="button button-secondary" href="/journal">
            Back to journal
          </Link>
        </header>

        <div className="contribution-grid">
          <div className="contribution-copy">
            <span className="section-kicker">SUPPORT THE PROJECT</span>
            <h1>Help keep Happiness Journal free and thoughtful.</h1>
            <p>
              Contributions are optional, one-time, and separate from your
              private journal data. You can support the project without changing
              your account or journal experience.
            </p>

            <div className="contribution-trust-card">
              <BrandMark size={44} />
              <div>
                <strong>Safe contribution principles</strong>
                <ul>
                  {trustPoints.map((point) => (
                    <li key={point}>
                      <span aria-hidden="true">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="contribution-panel">
            <div className="contribution-panel-header">
              <span>Secure checkout</span>
              <b>One-time</b>
            </div>
            <ContributionForm />
          </div>
        </div>
      </section>
    </main>
  );
}
