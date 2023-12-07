'use client'
import { ethers } from 'ethers'
import { Button, Flex, HStack, Input, Text, VStack } from '@chakra-ui/react'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { SetStateAction, useState } from 'react'
import { useGlobalContext } from '@/contexts/User'
import CardComponent from './Card'

export default function Transfer() {
    const { userId, setUserId, address, setAddress } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [privateAddress, setPrivateAddress] = useState('')
    const [value, setValue] = useState('')
    const handlePrivateAddressChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setPrivateAddress(event.target.value)
    const handleValueChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setValue(event.target.value)
    const transfer = async (): Promise<void> => {
        setIsLoading(true)
        try {
            const appAddress = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
            const app = new ethers.Contract(appAddress, abi)
            const data = app.interface.encodeFunctionData('transfer', [
                privateAddress,
            ])
            const hexValue = '0x' + BigInt(value).toString(16)
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: address,
                        to: appAddress,
                        value: hexValue,
                        data: data,
                    },
                ],
            })
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setValue('')
            setPrivateAddress('')
            setIsLoading(false)
        }
    }
    return (
        <CardComponent>
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
            <Button colorScheme="blue" onClick={transfer} isLoading={isLoading}>
                Transfer
            </Button>
        </CardComponent>
    )
}
