import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Visakh Madathil', // Change this to your name
  description: 'Personal website and blog', // Optional description
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-stone-50`}>
        <div className="pt-2"> {/* Added padding wrapper */}
          <Navigation />
          <Analytics />
          {children}
        </div>
      </body>
    </html>
  )
}