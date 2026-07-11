"use client";

import { useEffect, useState } from "react";

const phrases = [
  "Remember more.",
  "Track feelings.",
  "Relive the moments.",
];

const longestPhrase = phrases.reduce((longest, phrase) =>
  phrase.length > longest.length ? phrase : longest,
);

export function TypewriterText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  // Start with a complete thought so the server-rendered hero never feels empty.
  const [text, setText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const isComplete = text === phrase;
    const isEmpty = text.length === 0;
    let delay = isDeleting ? 28 : 54;

    if (isComplete && !isDeleting) delay = 1800;
    if (isEmpty && isDeleting) delay = 350;

    const timer = window.setTimeout(() => {
      if (isComplete && !isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (isEmpty && isDeleting) {
        setIsDeleting(false);
        setPhraseIndex((current) => (current + 1) % phrases.length);
        return;
      }

      setText(
        isDeleting
          ? phrase.slice(0, Math.max(0, text.length - 1))
          : phrase.slice(0, text.length + 1),
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [isDeleting, phraseIndex, text]);

  return (
    <span aria-label={phrases[phraseIndex]} className="typewriter">
      <span aria-hidden="true" className="typewriter-placeholder">
        {longestPhrase}
      </span>
      <span aria-hidden="true" className="typewriter-text">
        {text}
        <span aria-hidden="true" className="typewriter-cursor" />
      </span>
    </span>
  );
}
