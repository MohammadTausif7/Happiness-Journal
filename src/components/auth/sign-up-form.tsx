"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createVerificationCode,
  findAccountByEmail,
  registerAccount,
  saveSession,
} from "@/lib/demo-auth";

type Step = "details" | "verify";

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [reminderEmails, setReminderEmails] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordScore = useMemo(() => {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    return checks.filter(Boolean).length;
  }, [password]);

  function resetMessages() {
    setError("");
    setStatus("");
  }

  function validateDetails() {
    if (name.trim().length < 2) {
      return "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (passwordScore < 3) {
      return "Use at least 8 characters with a mix of uppercase letters, numbers, or symbols.";
    }

    if (password !== confirmPassword) {
      return "Your passwords do not match.";
    }

    if (!acceptPrivacy) {
      return "Please confirm that you understand the privacy notice.";
    }

    if (findAccountByEmail(email)) {
      return "An account already exists for this email. Try signing in instead.";
    }

    return "";
  }

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    const code = createVerificationCode();
    setVerificationCode(code);
    setStep("verify");
    setStatus("Verification code generated. In production, this is where the email provider will send it.");
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (codeInput.trim() !== verificationCode) {
      setError("That code does not match. Check the demo email card and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const account = await registerAccount({
        name,
        email,
        password,
        reminderEmails,
      });
      saveSession(account);
      router.push("/journal");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-form-wrap">
      <div className="form-title-row">
        <div>
          <span className="section-kicker">CREATE ACCOUNT</span>
          <h2>Start your private journal.</h2>
        </div>
        <span className="step-badge">{step === "details" ? "Step 1 of 2" : "Step 2 of 2"}</span>
      </div>

      {step === "details" ? (
        <form className="auth-form" onSubmit={handleDetailsSubmit}>
          <label>
            Name
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Mohammad Tausif"
              type="text"
              value={name}
            />
          </label>

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
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
              type="password"
              value={password}
            />
          </label>

          <div className="password-meter" aria-label={`Password strength ${passwordScore} out of 4`}>
            {[0, 1, 2, 3].map((index) => (
              <span className={index < passwordScore ? "active" : ""} key={index} />
            ))}
          </div>

          <label>
            Confirm password
            <input
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
            />
          </label>

          <label className="checkbox-row">
            <input
              checked={reminderEmails}
              onChange={(event) => setReminderEmails(event.target.checked)}
              type="checkbox"
            />
            <span>Email me gentle journal reminders and product updates.</span>
          </label>

          <label className="checkbox-row">
            <input
              checked={acceptPrivacy}
              onChange={(event) => setAcceptPrivacy(event.target.checked)}
              type="checkbox"
            />
            <span>
              I understand this increment uses local demo storage until the production privacy layer is added.
            </span>
          </label>

          {error && <p className="form-message error">{error}</p>}
          {status && <p className="form-message success">{status}</p>}

          <button className="button button-primary full-button" type="submit">
            Send verification code
            <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifySubmit}>
          <div className="demo-email-card">
            <span>Demo verification email</span>
            <strong>{verificationCode}</strong>
            <p>
              In a deployed version, this six-digit code will be sent to <b>{email.trim().toLowerCase()}</b>.
            </p>
          </div>

          <label>
            Verification code
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

          <button className="button button-primary full-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Verify and enter journal"}
            <span aria-hidden="true">✓</span>
          </button>
          <button className="text-link-button" onClick={() => setStep("details")} type="button">
            Edit account details
          </button>
        </form>
      )}

      <p className="auth-footnote">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}
