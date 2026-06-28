import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | Happiness Journal",
  description: "Sign in to Happiness Journal with password verification and a two-factor email-code step.",
};

export default function SignInPage() {
  return (
    <AuthPageShell
      description="Return to your calendar, your moods, and the little moments that might have slipped away otherwise."
      eyebrow="WELCOME BACK"
      switchHref="/sign-up"
      switchLabel="Create account"
      switchPrompt="New here?"
      title="Your private memories are waiting."
    >
      <SignInForm />
    </AuthPageShell>
  );
}
