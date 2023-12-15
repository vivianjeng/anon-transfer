'use client'
import {
    Box,
    Button,
    HStack,
    IconButton,
    Input,
    Link,
    Spacer,
    Text,
    useDisclosure,
} from '@chakra-ui/react'
import { RepeatIcon, UnlockIcon } from '@chakra-ui/icons'
const { Identity } = require('@semaphore-protocol/identity')
import { SetStateAction, useEffect, useState } from 'react'
import { JsonRpcSigner } from '@ethersproject/providers'
import CardComponent from './Card'
import Transaction from './Transaction'
import { useMetamask } from '@/hooks/Metamask'
import { useUnirepUser } from '@/hooks/User'

const MAX_VALUE = ((BigInt(1) << BigInt(64)) - BigInt(1)).toString()

export default function Withdraw() {
    const { isOpen, onToggle } = useDisclosure()
    const [txHash, setTxHash] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [ETHAddress, setETHAddress] = useState('')
    const [value, setValue] = useState('')
    // TODO: getData to compute balance
    const [pending, setPending] = useState('0')
    const [balance, setBalance] = useState('0')
    const { connect } = useMetamask()
    const { userWithdraw, getUserData } = useUnirepUser()
    const handleETHAddressChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setETHAddress(event.target.value)
    const handleValueChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setValue(event.target.value)

    const withdraw = async () => {
        setIsLoading(true)
        try {
            const signer = await connect()
            const id = new Identity(window.localStorage.getItem('userId'))
            const tx = await userWithdraw(
                id,
                signer as JsonRpcSigner,
                ETHAddress,
                value
            )
            setTxHash(tx)
            onToggle()
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setValue('')
            setETHAddress('')
            setIsLoading(false)
            if (isOpen) {
                onToggle()
            }
        }
    }

    const getData = async () => {
        setIsLoadingData(true)
        try {
            if (!window.localStorage.getItem('userId')) return
            const signer = await connect()
            const id = new Identity(window.localStorage.getItem('userId'))
            const { provableData, latestData } = await getUserData(
                id,
                signer as JsonRpcSigner
            )
            setBalance(provableData)
            setPending(latestData)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoadingData(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => {
                onToggle()
            }, 3000)
            return () => clearTimeout(timeout)
        }
    }, [isOpen])

    return (
        <CardComponent>
            <Transaction isOpen={isOpen} txHash={txHash} />
            <Text fontSize="2xl" w="full">
                Withdraw
            </Text>
            <HStack>
                <IconButton
                    isLoading={isLoadingData}
                    aria-label="refresh"
                    icon={<RepeatIcon />}
                    onClick={getData}
                    variant="outline"
                ></IconButton>
                <Box>Next epoch balance: {pending} gwei</Box>
                <Spacer />
                <Box>Current epoch balance: {balance} gwei</Box>
            </HStack>
            <HStack w="full">
                <Text w="250px">Input an ETH address:</Text>
                <Input
                    value={ETHAddress}
                    onChange={handleETHAddressChange}
                    placeholder="0x1234..."
                    w="full"
                    bgColor="white"
                    textColor="black"
                />
            </HStack>
            <HStack w="full">
                <Text w="250px">Input the amount of gwei: </Text>
                <Input
                    value={value}
                    onChange={handleValueChange}
                    placeholder="123..."
                    w="full"
                    bgColor="white"
                    textColor="black"
                />
            </HStack>
            <Button
                colorScheme="blue"
                onClick={withdraw}
                isLoading={isLoading}
                rightIcon={<UnlockIcon />}
            >
                Withdraw
            </Button>
        </CardComponent>
    )
}
