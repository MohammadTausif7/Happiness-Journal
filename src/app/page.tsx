import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/brand-mark";
import { ProductPreview } from "@/components/product-preview";
import { SiteHeader } from "@/components/site-header";
import { TypewriterText } from "@/components/typewriter-text";

const features = [
  {
    icon: "calendar",
    label: "A calendar with feeling",
    description:
      "See more than dates. Your month becomes a gentle map of moods, memories, and meaningful patterns.",
    accent: "peach",
  },
  {
    icon: "spark",
    label: "Moments that feel alive",
    description:
      "Every mood has a little atmosphere—from warm sunshine to soft rain and floating hearts.",
    accent: "lavender",
  },
  {
    icon: "lock",
    label: "Private by design",
    description:
      "Your journal is personal. Clear privacy controls and secure accounts keep it that way.",
    accent: "mint",
  },
];

const moods = [
  { emoji: "😊", label: "Happy", className: "mood-yellow" },
  { emoji: "🥰", label: "Loved", className: "mood-pink" },
  { emoji: "😌", label: "Calm", className: "mood-mint" },
  { emoji: "🤩", label: "Excited", className: "mood-purple" },
  { emoji: "😮", label: "Surprised", className: "mood-blue" },
  { emoji: "😔", label: "Sad", className: "mood-slate" },
  { emoji: "😤", label: "Frustrated", className: "mood-coral" },
];

function FeatureIcon({ name }: { name: string }) {
  if (name === "calendar") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <rect height="17" rx="4" stroke="currentColor" strokeWidth="1.7" width="18" x="3" y="4" />
        <path d="M7 2.5v4M17 2.5v4M3 9h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path d="m8 14 2 2 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M12 2.5c.6 5.1 3.4 8 8.5 8.5-5.1.6-7.9 3.4-8.5 8.5-.6-5.1-3.4-7.9-8.5-8.5C8.6 10.5 11.4 7.6 12 2.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M19 2v4M21 4h-4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="3" stroke="currentColor" strokeWidth="1.7" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      <circle cx="12" cy="15.5" fill="currentColor" r="1.2" />
    </svg>
  );
}

export default function Home() {
  return (
    <main id="top">
      <SiteHeader />

      <section className="hero section-shell">
        <div aria-hidden="true" className="hero-orb hero-orb-left" />
        <div aria-hidden="true" className="hero-orb hero-orb-right" />
        <div className="hero-copy">
          <div className="announcement">
            <span>✦</span>
            A brighter way to remember
          </div>
          <h1>
            Your days deserve
            <br />
            <TypewriterText />
          </h1>
          <p className="hero-lead">
            A private daily journal that transforms moods and memories into a
            beautiful calendar of your life.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/sign-up">
              Begin your journal
              <span aria-hidden="true">↗</span>
            </Link>
            <Link className="play-link" href="#experience">
              <span aria-hidden="true" className="play-icon">▶</span>
              See how it feels
            </Link>
          </div>
          <p className="hero-note">
            <span aria-hidden="true">✓</span> Free to use
            <span aria-hidden="true">·</span> Your moments stay yours
          </p>
        </div>

        <div className="hero-preview" id="experience">
          <ProductPreview />
        </div>
      </section>

      <section aria-labelledby="mood-heading" className="mood-section section-shell">
        <div className="section-heading centered-heading">
          <span className="section-kicker">HOW ARE YOU, REALLY?</span>
          <h2 id="mood-heading">There&apos;s room for every kind of day.</h2>
          <p>
            Choose what feels closest. No scores, no judgment—just a small,
            honest check-in with yourself.
          </p>
        </div>
        <div className="mood-row">
          {moods.map((mood, index) => (
            <div
              className={`mood-pill ${mood.className}`}
              key={mood.label}
              style={{ "--mood-index": index } as React.CSSProperties}
            >
              <span>{mood.emoji}</span>
              <small>{mood.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="features-heading" className="features-section section-shell" id="features">
        <div className="section-heading split-heading">
          <div>
            <span className="section-kicker">MADE FOR REAL LIFE</span>
            <h2 id="features-heading">Simple enough for every day. Meaningful enough to keep.</h2>
          </div>
          <p>
            Happiness Journal gets out of your way, while giving each memory a
            place that feels distinctly yours.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.accent}`} key={feature.label}>
              <div className="feature-icon">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3>{feature.label}</h3>
              <p>{feature.description}</p>
              <span className="feature-link">Explore the idea <b>→</b></span>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="steps-section" id="how-it-works">
        <div className="section-shell steps-inner">
          <div className="steps-copy">
            <span className="section-kicker">A MINUTE IS ENOUGH</span>
            <h2 id="steps-heading">Capture now.<br />Understand later.</h2>
            <p>
              The best journal is the one you actually return to. We made the
              ritual feel light, warm, and wonderfully uncomplicated.
            </p>
            <Link className="button button-dark" href="/sign-up">
              Write your first moment
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ol className="steps-list">
            <li>
              <span className="step-number">01</span>
              <div>
                <h3>Choose the day</h3>
                <p>Today, yesterday, or the Saturday you&apos;re still thinking about.</p>
              </div>
              <span aria-hidden="true" className="step-decoration">⌁</span>
            </li>
            <li>
              <span className="step-number">02</span>
              <div>
                <h3>Name the feeling</h3>
                <p>Pick a mood that&apos;s close enough. You can always change it.</p>
              </div>
              <span aria-hidden="true" className="step-decoration">☺</span>
            </li>
            <li>
              <span className="step-number">03</span>
              <div>
                <h3>Keep the moment</h3>
                <p>A sentence, a whole story, or anything in between—it belongs here.</p>
              </div>
              <span aria-hidden="true" className="step-decoration">✎</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="privacy-section section-shell">
        <div className="privacy-card">
          <div aria-hidden="true" className="privacy-art">
            <div className="privacy-halo" />
            <div className="privacy-lock">
              <span>♡</span>
            </div>
            <span className="privacy-star star-one">✦</span>
            <span className="privacy-star star-two">✧</span>
          </div>
          <div className="privacy-copy">
            <span className="section-kicker">PERSONAL MEANS PRIVATE</span>
            <h2>Your inner world isn&apos;t a product.</h2>
            <p>
              Your entries are yours. We use thoughtful security practices,
              clear account controls, and no advertising built from your memories.
            </p>
            <div className="privacy-points">
              <span><b>✓</b> Secure account access</span>
              <span><b>✓</b> Delete your data anytime</span>
              <span><b>✓</b> No selling personal entries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section section-shell">
        <div className="cta-card">
          <div aria-hidden="true" className="cta-doodle doodle-sun">☀</div>
          <div aria-hidden="true" className="cta-doodle doodle-heart">♡</div>
          <div aria-hidden="true" className="cta-doodle doodle-spark">✦</div>
          <BrandMark size={48} />
          <h2>A little more noticing.<br />A lot more living.</h2>
          <p>Your journal is waiting for its first honest moment.</p>
          <Link className="button button-primary" href="/sign-up">
            Start for free
            <span aria-hidden="true">↗</span>
          </Link>
          <small>No credit card. No pressure. Just your story.</small>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-shell footer-inner">
          <div className="footer-brand">
            <Wordmark />
            <p>A gentle place for the days that make a life.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Product</strong>
              <Link href="#features">Features</Link>
              <Link href="#how-it-works">How it works</Link>
              <Link href="/contribute">Contribute</Link>
            </div>
            <div>
              <strong>Company</strong>
              <Link href="/about">Our story</Link>
              <Link href="mailto:hello@happinessjournal.app">Contact</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
            <div>
              <strong>Account</strong>
              <Link href="/sign-in">Sign in</Link>
              <Link href="/sign-up">Create account</Link>
            </div>
          </div>
        </div>
        <div className="section-shell footer-bottom">
          <span>© {new Date().getFullYear()} Happiness Journal. All rights reserved.</span>
          <span>Made with care for your everyday moments.</span>
        </div>
      </footer>
    </main>
  );
}
