import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Using Outfit for headings if available
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AXIOM | Curiosity Engine",
  description: "A graph-based research assistant allowing you to traverse the knowledge space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} min-h-screen bg-black font-sans text-white antialiased selection:bg-indigo-500/30`}
      >
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
