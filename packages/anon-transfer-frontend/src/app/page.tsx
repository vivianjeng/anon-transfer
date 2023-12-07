'use client'
import Footer from '@/components/Footer'
import Wallet from '@/components/Wallet'
import { ChakraProvider, VStack, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    config: {
        useSystemColorMode: true,
        initialColorMode: 'light',
    },
})

export default function Home() {
    return (
        <ChakraProvider theme={theme}>
            <main className="flex min-h-screen flex-col items-center justify-between p-10 w-fill">
                <VStack gap={5} w="full">
                    <Wallet />
                    <Footer />
                </VStack>
            </main>
        </ChakraProvider>
    )
}
