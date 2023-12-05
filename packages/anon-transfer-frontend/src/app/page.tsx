import Wallet from '@/components/Wallet'
import { ChakraProvider, VStack } from '@chakra-ui/react'

export default function Home() {
    return (
        <ChakraProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-10 w-fill">
                <VStack gap={5}>
                    <Wallet />
                </VStack>
            </main>
        </ChakraProvider>
    )
}
