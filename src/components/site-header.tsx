"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand-mark";

const navItems = [
  { href: "#experience", label: "Experience" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="nav-shell">
        <Link aria-label="Happiness Journal home" href="#top">
          <Wordmark />
        </Link>

        <div className="desktop-nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="desktop-actions">
          <Link className="text-button" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button-dark button-small" href="/sign-up">
            Start journaling
          </Link>
        </div>

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="menu-button"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
        </button>

        {isOpen && (
          <div className="mobile-nav">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mobile-actions">
              <Link className="button button-secondary" href="/sign-in">
                Sign in
              </Link>
              <Link className="button button-dark" href="/sign-up">
                Start journaling
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
