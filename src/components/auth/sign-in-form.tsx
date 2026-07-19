"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createVerificationCode, saveSession, verifyCredentials } from "@/lib/demo-auth";
import type { DemoAccount } from "@/lib/demo-auth";
import {
  serverSignInStart,
  serverSignInVerify,
  useServerApiMode,
} from "@/lib/client/server-api";

type Step = "credentials" | "verify";

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [pendingAccount, setPendingAccount] = useState<DemoAccount | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isServerMode = useServerApiMode();

  function resetMessages() {
    setError("");
    setStatus("");
  }

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      if (isServerMode) {
        const result = await serverSignInStart({ email, password });
        setPendingAccount({
          id: "",
          name: email,
          email: email.trim().toLowerCase(),
          passwordHash: "",
          createdAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          preferences: {
            twoFactorEmail: true,
            reminderEmails: true,
            privateMoodStats: true,
            encryptedExportsOnly: true,
            theme: "system",
            calendarDefaultView: "month",
          },
        });
        setVerificationCode(result.devCode ?? "");
        setStep("verify");
        setStatus(result.devCode ? "Two-factor code ready. Enter it below to continue." : "Two-factor code sent to your email.");
        return;
      }

      const account = await verifyCredentials(email, password);

      if (!account) {
        setError("We could not find an account with that email and password.");
        return;
      }

      setPendingAccount(account);
      setVerificationCode(createVerificationCode());
      setStep("verify");
      setStatus("Two-factor code ready. Enter it below to continue.");
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to continue sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!pendingAccount) {
      setError("Your sign-in session expired. Please enter your email and password again.");
      setStep("credentials");
      return;
    }

    if (codeInput.trim() !== verificationCode) {
      setError("That two-factor code does not match.");
      return;
    }

    if (isServerMode) {
      serverSignInVerify({
        email,
        code: codeInput,
      })
        .then(() => router.push("/journal"))
        .catch((signInError) => {
          setError(signInError instanceof Error ? signInError.message : "Unable to verify code.");
        });
      return;
    }

    saveSession(pendingAccount);
    router.push("/journal");
  }

  return (
    <div className="auth-form-wrap">
      <div className="form-title-row">
        <div>
          <span className="section-kicker">WELCOME BACK</span>
          <h2>Sign in securely.</h2>
        </div>
        <span className="step-badge">{step === "credentials" ? "Password" : "2FA"}</span>
      </div>

      {step === "credentials" ? (
        <form className="auth-form" onSubmit={handleCredentialsSubmit}>
          <label>
            Email address
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              type="password"
              value={password}
            />
          </label>

          {error && <p className="form-message error">{error}</p>}
          {status && <p className="form-message success">{status}</p>}

          <button className="button button-dark full-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Checking..." : "Continue to 2FA"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifySubmit}>
          <div className="demo-email-card purple">
            <span>Two-factor code</span>
            <strong>{verificationCode || "Check email"}</strong>
            <p>
              Use the six-digit code to finish signing in as <b>{pendingAccount?.email}</b>.
            </p>
          </div>

          <label>
            Two-factor code
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setCodeInput(event.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              type="text"
              value={codeInput}
            />
          </label>

          {error && <p className="form-message error">{error}</p>}
          {status && <p className="form-message success">{status}</p>}

          <button className="button button-dark full-button" type="submit">
            Enter journal
            <span aria-hidden="true">✓</span>
          </button>
          <button className="text-link-button" onClick={() => setStep("credentials")} type="button">
            Use a different account
          </button>
        </form>
      )}

      <p className="auth-footnote">
        New to Happiness Journal? <Link href="/sign-up">Create an account</Link>
      </p>
    </div>
  );
}
