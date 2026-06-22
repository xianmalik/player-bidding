import "@/app/globals.css";
import { Open_Sans as FontSans } from "next/font/google";

const font = FontSans({ subsets: ["latin"] });

import type { Metadata } from "next";
import ChampionDataProvider from "@/components/ChampionDataProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ArenaDraft",
  description: "League of Legends draft tool",
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
