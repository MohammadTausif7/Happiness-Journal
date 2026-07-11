"use client";

import { FormEvent, useMemo, useState } from "react";

type CheckoutState =
  | { status: "idle"; message: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const contributionAmounts = [5, 10, 25, 50];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContributionForm() {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    status: "idle",
    message: "Choose an amount to continue to secure checkout.",
  });

  const resolvedAmount = useMemo(() => {
    const custom = Number(customAmount);
    return customAmount ? custom : amount;
  }, [amount, customAmount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isFinite(resolvedAmount) || resolvedAmount < 1 || resolvedAmount > 500) {
      setCheckoutState({
        status: "error",
        message: "Please choose an amount between $1 and $500.",
      });
      return;
    }

    if (email && !isValidEmail(email)) {
      setCheckoutState({
        status: "error",
        message: "Please enter a valid email address or leave it blank.",
      });
      return;
    }

    setCheckoutState({
      status: "loading",
      message: "Preparing secure checkout...",
    });

    try {
      const response = await fetch("/api/contributions/checkout", {
        body: JSON.stringify({
          amount: resolvedAmount,
          currency: "usd",
          donorEmail: email || undefined,
          note: message || undefined,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        setCheckoutState({
          status: "error",
          message: result.message ?? "Checkout is not available yet.",
        });
        return;
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setCheckoutState({
        status: "success",
        message: result.message ?? "Checkout request validated successfully.",
      });
    } catch {
      setCheckoutState({
        status: "error",
        message: "Could not reach the checkout endpoint. Please try again.",
      });
    }
  }

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <div className="contribution-amount-grid" role="group" aria-label="Contribution amount">
        {contributionAmounts.map((value) => (
          <button
            className={amount === value && !customAmount ? "selected" : ""}
            key={value}
            onClick={() => {
              setAmount(value);
              setCustomAmount("");
            }}
            type="button"
          >
            ${value}
          </button>
        ))}
      </div>

      <label>
        Custom amount
        <input
          inputMode="decimal"
          min="1"
          max="500"
          onChange={(event) => setCustomAmount(event.target.value)}
          placeholder="Optional"
          type="number"
          value={customAmount}
        />
      </label>

      <label>
        Receipt email
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </label>

      <label>
        Note
        <textarea
          maxLength={220}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Optional message of support"
          rows={4}
          value={message}
        />
      </label>

      <button className="button button-primary" disabled={checkoutState.status === "loading"} type="submit">
        {checkoutState.status === "loading" ? "Preparing checkout..." : "Continue securely"}
        <span aria-hidden="true">↗</span>
      </button>

      <p className={`contribution-status ${checkoutState.status}`} role="status">
        {checkoutState.message}
      </p>
    </form>
  );
}
