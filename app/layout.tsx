import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "勤怠管理システム",
  description: "勤怠管理システム",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
