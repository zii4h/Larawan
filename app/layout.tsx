import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Larawan — habits, visualized.',
  description: 'A personal consistency heatmap system inspired by GitHub — but for life habits.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-950 antialiased font-[family-name:var(--font-geist)]">
        {children}
      </body>
    </html>
  )
}
