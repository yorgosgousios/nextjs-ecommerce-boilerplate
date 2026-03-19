import { Inter } from "next/font/google";

/**
 * Font optimization with next/font.
 *
 * Why this matters:
 * - Fonts are self-hosted (no external requests to Google Fonts)
 * - CSS size-adjust prevents layout shift while font loads
 * - Font files are automatically subset to only used characters
 *
 * Usage in _app.tsx:
 *   <main className={inter.className}>
 */
export const inter = Inter({
  subsets: ["latin", "greek"],
  display: "swap",
  variable: "--font-inter",
});
