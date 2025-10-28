import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"


export const metadata: Metadata = {
  title: "COOPEFACSA R.L - Gestión de Vacaciones",
  description: "Sistema de gestión de vacaciones para Cooperativa San Antonio",
  icons: {
    icon: '/logo2.png',
    shortcut: '/logo2.png',
    apple: '/logo2.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display for headings + Merriweather for body text (Google Fonts) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-serif antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
