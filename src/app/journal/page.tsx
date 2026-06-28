import type { Metadata } from "next";
import { JournalDashboard } from "@/components/journal/journal-dashboard";

export const metadata: Metadata = {
  title: "Journal Dashboard | Happiness Journal",
  description: "View your Happiness Journal calendar and account session after signing in.",
};

export default function JournalPage() {
  return <JournalDashboard />;
}
