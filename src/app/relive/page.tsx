import type { Metadata } from "next";
import { ReliveMoments } from "@/components/journal/relive-moments";

export const metadata: Metadata = {
  title: "Relive Moments | Happiness Journal",
  description: "Browse your Happiness Journal timeline and open saved entries in an immersive mood reader.",
};

export default function RelivePage() {
  return <ReliveMoments />;
}
