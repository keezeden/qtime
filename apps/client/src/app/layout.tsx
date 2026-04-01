import type { Metadata } from "next";
import {
  Be_Vietnam_Pro,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const accentFont = Plus_Jakarta_Sans({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "QTime",
  description:
    "QTime is a real-time 1v1 word duel where players race the clock and build winning boards under pressure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${accentFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
