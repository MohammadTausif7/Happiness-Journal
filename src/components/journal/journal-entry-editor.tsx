"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatDateKey,
  getMoodMeta,
  moodOptions,
  saveJournalEntry,
  updateJournalEntry,
} from "@/lib/demo-journal";
import type { JournalEntry, JournalMood } from "@/lib/demo-journal";

type JournalEntryEditorProps = {
  accountId: string;
  entry?: JournalEntry | null;
  selectedDate: string;
  onClose: () => void;
  onSaved: (entry: JournalEntry) => void;
};

const prompts = [
  "What happened today?",
  "What do you want to remember?",
  "What felt unexpectedly good?",
  "What would you tell tomorrow-you?",
];

export function JournalEntryEditor({
  accountId,
  entry,
  selectedDate,
  onClose,
  onSaved,
}: JournalEntryEditorProps) {
  const [date, setDate] = useState(entry?.date ?? selectedDate ?? formatDateKey(new Date()));
  const [title, setTitle] = useState(entry?.title ?? "");
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? "happy");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [message, setMessage] = useState("");
  const moodMeta = getMoodMeta(mood);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 3) {
      setMessage("Add a short title so this moment is easier to find later.");
      return;
    }

    if (notes.trim().length < 6) {
      setMessage("Write at least one sentence before saving the entry.");
      return;
    }

    const savedEntry = entry
      ? updateJournalEntry({
          id: entry.id,
          accountId,
          date,
          title,
          mood,
          notes,
        })
      : saveJournalEntry({
          accountId,
          date,
          title,
          mood,
          notes,
        });

    if (savedEntry) {
      onSaved(savedEntry);
    }
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div aria-modal="true" className="journal-editor-overlay" role="dialog">
      <button aria-label="Close journal editor" className="editor-scrim" onClick={onClose} type="button" />

      <section className={`journal-editor-panel ${moodMeta.className}`}>
        <div aria-hidden="true" className="editor-atmosphere">
          <span className="scene-sun" />
          <span className="scene-emoji">{moodMeta.emoji}</span>
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
        </div>

        <header className="editor-header">
          <div>
            <span className="section-kicker">{entry ? "EDIT MOMENT" : "NEW MOMENT"}</span>
            <h2>{entry ? "Refine what happened." : "Capture the day while it is still warm."}</h2>
          </div>
          <button aria-label="Close editor" className="editor-close-button" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <form className="journal-editor-form" onSubmit={handleSubmit}>
          <div className="editor-field-grid">
            <label>
              Date
              <input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
            </label>
            <label>
              Title
              <input
                autoFocus
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this moment a name"
                type="text"
                value={title}
              />
            </label>
          </div>

          <div className="editor-mood-palette" role="radiogroup" aria-label="Choose a mood">
            {moodOptions.map((option) => (
              <button
                aria-checked={mood === option.id}
                className={`${option.className} ${mood === option.id ? "active" : ""}`}
                key={option.id}
                onClick={() => setMood(option.id)}
                role="radio"
                type="button"
              >
                <span>{option.emoji}</span>
                <small>{option.label}</small>
              </button>
            ))}
          </div>

          <label className="editor-notes-field">
            Journal notes
            <textarea
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write the messy, honest version. You can polish it later."
              rows={8}
              value={notes}
            />
          </label>

          <div className="editor-prompt-row" aria-label="Writing prompts">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setNotes((current) => `${current}${current ? "\n\n" : ""}${prompt} `)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          {message && <p className="form-message error">{message}</p>}

          <div className="editor-actions">
            <button className="button button-secondary" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              {entry ? "Save changes" : "Save journal entry"}
              <span aria-hidden="true">✦</span>
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
