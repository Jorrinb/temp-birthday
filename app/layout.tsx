import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maria's Birthday Bucket List 🎂",
  description: "A birthday night bucket list for the whole squad",
  other: {
    "theme-color": "#0d0d0d",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
