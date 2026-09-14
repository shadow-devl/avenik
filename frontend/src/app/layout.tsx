import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Avenik — Startup Ecosystem Platform",
  description:
    "India's comprehensive startup ecosystem platform. Connecting entrepreneurs, investors, mentors, government schemes, and the entire startup support system with trust-first design.",
  keywords: [
    "startup",
    "ecosystem",
    "india",
    "entrepreneur",
    "investor",
    "mentor",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
