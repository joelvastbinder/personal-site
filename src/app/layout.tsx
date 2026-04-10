import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

const siteName = 'Joel V on the Web';
const siteDescription =
  'Personal portfolio site with an AI assistant that can answer questions and restyle the resume.'

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  icons: {
    apple: "/icon.png",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/',
    siteName: siteName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: siteName }],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e1e1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
