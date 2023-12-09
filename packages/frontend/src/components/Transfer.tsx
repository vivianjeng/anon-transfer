'use client'
import { ethers } from 'ethers'
import {
    Alert,
    AlertDialog,
    AlertIcon,
    Box,
    Button,
    Flex,
    HStack,
    Input,
    Link,
    Progress,
    SlideFade,
    Spacer,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react'
import {
    ArrowForwardIcon,
    CheckCircleIcon,
    ExternalLinkIcon,
} from '@chakra-ui/icons'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { SetStateAction, useEffect, useState } from 'react'
import { appAddress, chainId, useGlobalContext } from '@/contexts/User'
import CardComponent from './Card'
import Transaction from './Transaction'

declare global {
    interface Window {
        ethereum?: any
    }
}

export default function Transfer() {
    const { isOpen, onToggle } = useDisclosure()
    const { address, setAddress } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [privateAddress, setPrivateAddress] = useState('')
    const [value, setValue] = useState('')
    const [txHash, setTxHash] = useState('')
    const handlePrivateAddressChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setPrivateAddress(event.target.value)
    const handleValueChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setValue(event.target.value)
    const transfer = async (): Promise<void> => {
        setIsLoading(true)
        try {
            const app = new ethers.Contract(appAddress, abi)
            const data = app.interface.encodeFunctionData('transfer', [
                privateAddress,
            ])
            const hexValue = '0x' + BigInt(value).toString(16)
            let connectedAddress = address
            if (address === '') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                connectedAddress = accounts[0]
                setAddress(accounts[0])
            }

            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
                params: [],
            })

            if (BigInt(currentChainId) !== BigInt(chainId)) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [
                        {
                            chainId: chainId,
                        },
                    ],
                })
            }
            const tx = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: connectedAddress,
                        to: appAddress,
                        value: hexValue,
                        data: data,
                    },
                ],
            })
            setTxHash(tx)
            onToggle()
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setValue('')
            setPrivateAddress('')
            setIsLoading(false)
            if (isOpen) {
                onToggle()
            }
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
                Transfer
            </Text>
            <HStack w="full">
                <Text w="250px">Input an private address: </Text>
                <Input
                    value={privateAddress}
                    onChange={handlePrivateAddressChange}
                    placeholder="0x1234..."
                    w="full"
                    textColor="black"
                    bgColor="white"
                />
            </HStack>
            <HStack w="full">
                <Text w="250px">Input the amount of wei: </Text>
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
                onClick={transfer}
                isLoading={isLoading}
                rightIcon={<ArrowForwardIcon />}
            >
                Transfer
            </Button>
        </CardComponent>
    )
}
