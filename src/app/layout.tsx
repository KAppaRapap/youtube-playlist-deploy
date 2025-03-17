import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'YouTube Playlist Generator - Create Custom Playlists',
  description: 'Create personalized YouTube playlists based on your music preferences. Find the perfect playlist for any mood, genre, or era.',
  keywords: 'youtube, playlist, music, generator, mood, genres, era',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>
          <div className="min-h-screen">
            <header className="bg-red-600 text-white py-6 mb-8">
              <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold">YouTube Playlist Generator</h1>
                <p className="mt-2 text-red-100">Find your perfect playlist in seconds</p>
              </div>
            </header>
            {children}
            <footer className="bg-gray-800 text-white py-6 mt-8">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400">
                  Made by <a href="https://www.instagram.com/dinis.ivanets/?hl=en" target="_blank" rel="noopener noreferrer">Dinis Ivanets</a>
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
