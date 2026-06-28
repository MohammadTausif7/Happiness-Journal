import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account | Happiness Journal",
  description: "Create a Happiness Journal account and verify your email with a secure two-step flow.",
};

export default function SignUpPage() {
  return (
    <AuthPageShell
      description="Create a secure account, verify your email, and land inside a private journal workspace built for daily reflection."
      eyebrow="NEW BEGINNINGS"
      switchHref="/sign-in"
      switchLabel="Sign in"
      switchPrompt="Already journaling?"
      title="A softer place to keep your days."
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
