import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GlobalContextProvider } from '@/contexts/User'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Anon transfer',
    description:
        'An anonymous transfer system that disconnects all addresses and values.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <GlobalContextProvider>
                <body className={inter.className}>{children}</body>
            </GlobalContextProvider>
        </html>
    )
}
