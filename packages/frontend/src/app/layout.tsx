import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GlobalContextProvider } from '@/contexts/User'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Anon Transfer',
    description:
        'Transfer X ETH with A account, withdraw Y ETH with B account.',
    applicationName: 'Anon transfer',
    authors: { name: '@vivianjeng', url: 'https://github.com/vivianjeng' },
    generator: 'Next.js',
    keywords: [
        'Anonymous',
        'Transfer',
        'ETH',
        'Ethereum',
        'ZKP',
        'Zero Knowledge Proof',
        'UniRep',
        'Privacy',
    ],
    icons: {
        icon: 'https://anon-transfer.online/favicon.ico',
        apple: 'https://anon-transfer.online/apple-touch-icon.png',
    },
    manifest: 'https://anon-transfer.online/manifest.json',
    openGraph: {
        type: 'website',
        url: 'https://example.com',
        title: 'Anon Transfer',
        description:
            'Transfer X ETH with A account, withdraw Y ETH with B account.',
        siteName: 'Anon Transfer',
        images: [
            {
                url: 'https://anon-transfer.online/og.png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@UniRep_Protocol',
        creator: '@vivi4322',
        images: 'https://anon-transfer.online/og.png',
    },
    appleWebApp: {
        capable: true,
        title: 'Anon Transfer',
        statusBarStyle: 'default',
    },
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
