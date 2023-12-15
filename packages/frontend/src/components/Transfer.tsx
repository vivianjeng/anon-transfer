'use client'
import { ethers } from 'ethers'
import { Button, HStack, Input, Text, useDisclosure } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { SetStateAction, useEffect, useState } from 'react'
import { appAddress } from '@/contexts/User'
import CardComponent from './Card'
import Transaction from './Transaction'
import { useMetamask } from '@/hooks/Metamask'

export default function Transfer() {
    const { isOpen, onToggle } = useDisclosure()
    const [isLoading, setIsLoading] = useState(false)
    const [privateAddress, setPrivateAddress] = useState('')
    const [value, setValue] = useState('')
    const [txHash, setTxHash] = useState('')
    const { connect } = useMetamask()
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
            const hexValue = ethers.utils
                .parseUnits(BigInt(value).toString(), 'gwei')
                .toHexString()
            const signer = await connect()
            const params = [
                {
                    from: await signer.getAddress(),
                    to: appAddress,
                    value: hexValue,
                    data: data,
                },
            ]
            const tx = await signer?.provider.send(
                'eth_sendTransaction',
                params
            )
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
                onClick={transfer}
                isLoading={isLoading}
                rightIcon={<ArrowForwardIcon />}
            >
                Transfer
            </Button>
        </CardComponent>
    )
}
