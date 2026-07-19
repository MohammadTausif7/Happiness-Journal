"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import {
  deleteAccount,
  getAccountById,
  getSession,
  updateAccountPreferences,
  updateAccountProfile,
  verifyAccountPassword,
} from "@/lib/demo-auth";
import { deleteJournalEntries, getJournalEntries } from "@/lib/demo-journal";
import { downloadJsonFile, encryptExportPayload } from "@/lib/demo-privacy";
import type { AccountTheme, CalendarDefaultView, DemoAccount, DemoSession } from "@/lib/demo-auth";
import type { JournalEntry } from "@/lib/demo-journal";
import {
  serverDeleteAccount,
  serverExportJournal,
  serverGetAccount,
  serverGetJournalEntries,
  serverUpdatePreferences,
  serverUpdateProfile,
  useServerApiMode,
} from "@/lib/client/server-api";

const themes: Array<{ id: AccountTheme; label: string; description: string }> = [
  { id: "system", label: "System", description: "Follow your device preference." },
  { id: "light", label: "Light", description: "Clean paper-like workspace." },
  { id: "sunset", label: "Sunset", description: "Warm peach and lavender glow." },
  { id: "calm", label: "Calm", description: "Soft green and sky tones." },
  { id: "midnight", label: "Midnight", description: "Darker private writing mood." },
];

const calendarViews: Array<{ id: CalendarDefaultView; label: string }> = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "today", label: "Today" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function applyTheme(theme: AccountTheme) {
  document.documentElement.dataset.accountTheme = theme;
}

export function AccountManagement() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [exportPassphrase, setExportPassphrase] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isServerMode = useServerApiMode();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          if (isServerMode) {
            const accountResult = await serverGetAccount();
            const journalResult = await serverGetJournalEntries();
            const serverAccount = { ...accountResult.account, passwordHash: "" };
            setSession({
              accountId: serverAccount.id,
              email: serverAccount.email,
              name: serverAccount.name,
              signedInAt: new Date().toISOString(),
            });
            setAccount(serverAccount);
            setName(serverAccount.name);
            setEmail(serverAccount.email);
            setEntries(journalResult.entries);
            applyTheme(serverAccount.preferences.theme ?? "system");
            return;
          }

          const currentSession = getSession();
          const currentAccount = currentSession ? getAccountById(currentSession.accountId) : null;
          setSession(currentSession);
          setAccount(currentAccount);

          if (currentAccount) {
            setName(currentAccount.name);
            setEmail(currentAccount.email);
            setEntries(getJournalEntries(currentAccount.id));
            applyTheme(currentAccount.preferences.theme ?? "system");
          }
        } catch {
          setError("Account settings could not be opened. Please sign in again or reload.");
        } finally {
          setIsReady(true);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isServerMode]);

  const accountStats = useMemo(() => {
    const latestEntry = entries[0];
    return {
      entryCount: entries.length,
      latestEntryDate: latestEntry?.date ?? "No entries yet",
      createdAt: account ? new Date(account.createdAt).toLocaleDateString() : "—",
    };
  }, [account, entries]);

  function refreshAccount(accountId = account?.id) {
    if (!accountId) {
      return;
    }

    const updatedAccount = getAccountById(accountId);
    setAccount(updatedAccount);
    setSession(getSession());
    setEntries(getJournalEntries(accountId));

    if (updatedAccount) {
      applyTheme(updatedAccount.preferences.theme ?? "system");
    }
  }

  function clearMessages() {
    setStatus("");
    setError("");
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    if (!account) {
      return;
    }

    if (name.trim().length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      if (isServerMode) {
        const updatedAccount = await serverUpdateProfile({ name, email });
        setAccount({ ...updatedAccount, passwordHash: "" });
        setSession({
          accountId: updatedAccount.id,
          email: updatedAccount.email,
          name: updatedAccount.name,
          signedInAt: new Date().toISOString(),
        });
      } else {
        updateAccountProfile({ accountId: account.id, name, email });
        refreshAccount(account.id);
      }

      setStatus("Profile updated.");
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Unable to update profile.");
    }
  }

  async function handlePreferenceChange(preferences: Partial<DemoAccount["preferences"]>) {
    clearMessages();

    if (!account) {
      return;
    }

    if (isServerMode) {
      const updatedAccount = await serverUpdatePreferences(preferences);
      setAccount({ ...updatedAccount, passwordHash: "" });
      applyTheme(updatedAccount.preferences.theme ?? "system");
      setStatus("Preferences saved.");
      return;
    }

    const updatedAccount = updateAccountPreferences(account.id, preferences);

    if (updatedAccount) {
      setAccount(updatedAccount);
      applyTheme(updatedAccount.preferences.theme ?? "system");
      setStatus("Preferences saved.");
    }
  }

  async function handleEncryptedExport() {
    clearMessages();

    if (!account) {
      return;
    }

    setIsExporting(true);

    try {
      if (isServerMode) {
        const encryptedArchive = await serverExportJournal(exportPassphrase);
        downloadJsonFile(`happiness-journal-export-${account.email}.encrypted.json`, encryptedArchive);
        setExportPassphrase("");
        setStatus("Encrypted export downloaded. Keep your passphrase somewhere safe.");
        return;
      }

      const safeAccount = {
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
        verifiedAt: account.verifiedAt,
        updatedAt: account.updatedAt,
        preferences: account.preferences,
      };
      const payload = {
        exportedAt: new Date().toISOString(),
        account: safeAccount,
        entries,
        securityNote:
          "This export is encrypted with your passphrase. Keep the passphrase somewhere safe because it cannot be recovered.",
      };
      const encryptedArchive = await encryptExportPayload(
        payload,
        exportPassphrase,
      );
      downloadJsonFile(`happiness-journal-export-${account.email}.encrypted.json`, encryptedArchive);
      setExportPassphrase("");
      setStatus("Encrypted export downloaded. Keep your passphrase somewhere safe.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Unable to create encrypted export.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    if (!account) {
      return;
    }

    if (deleteConfirmation !== "DELETE") {
      setError("Type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);

    try {
      if (isServerMode) {
        await serverDeleteAccount({
          password: deletePassword,
          confirmation: deleteConfirmation,
        });
        router.push("/sign-up");
        return;
      }

      const passwordMatches = await verifyAccountPassword(account.id, deletePassword);

      if (!passwordMatches) {
        setError("Password confirmation failed.");
        return;
      }

      deleteJournalEntries(account.id);
      deleteAccount(account.id);
      router.push("/sign-up");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isReady) {
    return (
      <main className="settings-page loading-page">
        <p>Opening account settings...</p>
      </main>
    );
  }

  if (!session || !account) {
    return (
      <main className="settings-page empty-session-page">
        <section className="empty-session-card">
          <BrandMark size={46} />
          <h1>Please sign in first.</h1>
          <p>Sign in to manage your profile, privacy options, exports, and account settings.</p>
          <Link className="button button-primary" href="/sign-in">
            Go to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <header className="settings-hero">
        <Link aria-label="Back to journal dashboard" className="journal-brand" href="/journal">
          <BrandMark size={38} />
          <span>Happiness Journal</span>
        </Link>
        <div>
          <span className="section-kicker">ACCOUNT CENTER</span>
          <h1>Settings that keep your journal yours.</h1>
          <p>
            Manage profile details, privacy posture, theme defaults, export controls, and deletion from one place.
          </p>
        </div>
        <Link className="button button-dark" href="/journal">
          Back to journal
        </Link>
      </header>

      {(status || error) && (
        <div className={`settings-toast ${error ? "error" : "success"}`} role="status">
          {error || status}
        </div>
      )}

      <section className="settings-grid">
        <article className="settings-card profile-settings-card">
          <span className="section-kicker">PROFILE</span>
          <h2>Your account</h2>
          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <label>
              Display name
              <input onChange={(event) => setName(event.target.value)} type="text" value={name} />
            </label>
            <label>
              Email address
              <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </label>
            <button className="button button-primary" type="submit">
              Save profile
            </button>
          </form>
        </article>

        <article className="settings-card">
          <span className="section-kicker">PRIVACY</span>
          <h2>Account privacy</h2>
          <div className="settings-toggle-list">
            <label>
              <input
                checked={account.preferences.twoFactorEmail}
                onChange={(event) => handlePreferenceChange({ twoFactorEmail: event.target.checked })}
                type="checkbox"
              />
              <span>
                <strong>Email verification codes</strong>
                Keep email-code sign-in enabled for this account.
              </span>
            </label>
            <label>
              <input
                checked={account.preferences.privateMoodStats}
                onChange={(event) => handlePreferenceChange({ privateMoodStats: event.target.checked })}
                type="checkbox"
              />
              <span>
                <strong>Private mood summaries</strong>
                Keep mood insights account-scoped and hidden from public pages.
              </span>
            </label>
            <label>
              <input
                checked={account.preferences.encryptedExportsOnly}
                onChange={(event) => handlePreferenceChange({ encryptedExportsOnly: event.target.checked })}
                type="checkbox"
              />
              <span>
                <strong>Encrypted exports only</strong>
                Require passphrase-protected exports for journal backups.
              </span>
            </label>
          </div>
        </article>

        <article className="settings-card">
          <span className="section-kicker">PREFERENCES</span>
          <h2>Theme and calendar</h2>
          <div className="settings-option-group">
            <h3>Theme</h3>
            <div className="theme-choice-grid">
              {themes.map((theme) => (
                <button
                  className={account.preferences.theme === theme.id ? "active" : ""}
                  key={theme.id}
                  onClick={() => handlePreferenceChange({ theme: theme.id })}
                  type="button"
                >
                  <span className={`theme-swatch ${theme.id}`} />
                  <strong>{theme.label}</strong>
                  <small>{theme.description}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-option-group">
            <h3>Default calendar view</h3>
            <div className="calendar-choice-row">
              {calendarViews.map((view) => (
                <button
                  className={account.preferences.calendarDefaultView === view.id ? "active" : ""}
                  key={view.id}
                  onClick={() => handlePreferenceChange({ calendarDefaultView: view.id })}
                  type="button"
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          <label className="settings-inline-toggle">
            <input
              checked={account.preferences.reminderEmails}
              onChange={(event) => handlePreferenceChange({ reminderEmails: event.target.checked })}
              type="checkbox"
            />
            Send gentle reminder and update emails
          </label>
        </article>

        <article className="settings-card">
          <span className="section-kicker">DATA CONTROLS</span>
          <h2>Export and audit</h2>
          <div className="settings-stat-list">
            <p><strong>{accountStats.entryCount}</strong> journal entries saved</p>
            <p><strong>{accountStats.createdAt}</strong> account created</p>
            <p><strong>{accountStats.latestEntryDate}</strong> latest entry date</p>
          </div>
          <div className="settings-form">
            <label>
              Export passphrase
              <input
                onChange={(event) => setExportPassphrase(event.target.value)}
                placeholder="At least 12 characters"
                type="password"
                value={exportPassphrase}
              />
            </label>
            <button className="button button-dark" disabled={isExporting} onClick={handleEncryptedExport} type="button">
              {isExporting ? "Encrypting..." : "Download encrypted export"}
            </button>
          </div>
        </article>

        <article className="settings-card security-card">
          <span className="section-kicker">SECURITY</span>
          <h2>How your journal is protected</h2>
          <ul>
            <li>Your password is stored as a one-way hash.</li>
            <li>Journal exports are encrypted with a passphrase you choose.</li>
            <li>Account deletion removes your profile and journal entries from this browser.</li>
            <li>Privacy controls keep mood summaries and reminders under your control.</li>
          </ul>
        </article>

        <article className="settings-card danger-card">
          <span className="section-kicker">DANGER ZONE</span>
          <h2>Delete account</h2>
          <p>
            This removes your account, current session, and saved journal entries from this browser.
          </p>
          <form className="settings-form" onSubmit={handleDeleteAccount}>
            <label>
              Current password
              <input
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="Confirm your password"
                type="password"
                value={deletePassword}
              />
            </label>
            <label>
              Type DELETE
              <input
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder="DELETE"
                type="text"
                value={deleteConfirmation}
              />
            </label>
            <button className="button button-primary" disabled={isDeleting} type="submit">
              {isDeleting ? "Deleting..." : "Delete account"}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
