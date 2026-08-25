import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martyn's Law Compliance Checklist | Sotara",
  description: "Standard Tier compliance checklist for schools and trusts under the Terrorism (Protection of Premises) Act 2025.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
