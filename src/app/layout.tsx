import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResearchScroll — Research Papers, But Make It Fun 🧪",
  description: "Discover groundbreaking science explained simply. No PhD required. Join 50K+ curious minds exploring AI, space, climate, and more!",
  keywords: ["research", "papers", "science", "AI", "machine learning", "teens", "education", "arxiv"],
  openGraph: {
    title: "ResearchScroll — Research Papers, But Make It Fun 🧪",
    description: "Discover groundbreaking science explained simply. No PhD required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
