'use client'
import { Text, Box, HStack, Spacer, VStack } from '@chakra-ui/react'
import { TimeIcon } from '@chakra-ui/icons'
import React from 'react'

import { useEffect } from 'react'
import AddressList from './AddressList'
import Transfer from './Transfer'
import Withdraw from './Withdraw'
import { calcEpoch, remainingTime, useGlobalContext } from '@/contexts/User'

export default function Wallet() {
    const { epoch, setEpoch } = useGlobalContext()
    const [remaining, setRemaining] = React.useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setEpoch(calcEpoch())
            setRemaining(remainingTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <VStack w="80%" pt={50}>
            <HStack w="full">
                <Text>Epoch: {epoch}</Text>
                <Spacer width="5rem"></Spacer>
                <TimeIcon />
                <Text>Epoch remaining time: {remaining}</Text>
            </HStack>
            <AddressList />
            <Transfer />
            <Withdraw />
            <Box h="100px" />
        </VStack>
    )
}
