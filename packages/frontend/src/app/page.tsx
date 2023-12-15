'use client'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Wallet from '@/components/Wallet'
import { ChakraProvider, VStack } from '@chakra-ui/react'

export default function Home() {
    return (
        <ChakraProvider>
            <Header />
            <VStack p={10} gap={5} w="full">
                <Wallet />
            </VStack>
            <Footer display={{ base: 'none', md: 'flex' }} />
        </ChakraProvider>
    )
}
