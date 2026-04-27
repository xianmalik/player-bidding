import "@/app/globals.css"
import { Open_Sans as FontSans } from "next/font/google";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const font = FontSans({ subsets: ["latin"] });

import { Toaster } from "@/components/ui/sonner"
import ChampionDataProvider from "@/components/ChampionDataProvider"

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
  )
}
