import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Happiness Journal — Notice the good",
    template: "%s | Happiness Journal",
  },
  description:
    "A thoughtful daily journal that turns your moods and memories into a calendar you will want to revisit.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Happiness Journal — Notice the good",
    description:
      "Capture a moment, choose a mood, and watch your emotional calendar come alive.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8f7f2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
