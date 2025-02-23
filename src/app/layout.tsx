import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

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
      <body className={`${inter.className} min-h-screen bg-white`}>
        <div className="pt-2"> {/* Added padding wrapper */}
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}