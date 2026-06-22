import "@/app/globals.css";
import { Open_Sans as FontSans } from "next/font/google";

const font = FontSans({ subsets: ["latin"] });

import type { Metadata } from "next";
import ChampionDataProvider from "@/components/ChampionDataProvider";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/const";

const title = "ArenaDraft";
const description = "League of Legends draft tool";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <ChampionDataProvider>
          {children}
          <Toaster />
        </ChampionDataProvider>
      </body>
    </html>
  );
}
