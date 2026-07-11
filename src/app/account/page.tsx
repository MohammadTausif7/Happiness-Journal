import type { Metadata } from "next";
import { AccountManagement } from "@/components/account/account-management";

export const metadata: Metadata = {
  title: "Account Settings | Happiness Journal",
  description: "Manage Happiness Journal profile, privacy preferences, theme, calendar defaults, exports, and deletion.",
};

export default function AccountPage() {
  return <AccountManagement />;
}
