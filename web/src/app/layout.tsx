import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Owner access | ACH Admin",
  description: "A thoughtful workspace for hospital owners and administrators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
