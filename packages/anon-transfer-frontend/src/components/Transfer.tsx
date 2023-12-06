'use client'
import { ethers } from 'ethers'
import { Button, HStack, Input, Text, VStack } from '@chakra-ui/react'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { SetStateAction, useState } from 'react'
import { useGlobalContext } from '@/contexts/User'


export default function Transfer() {
    const { userId, setUserId, address, setAddress,} = useGlobalContext()
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
        <VStack bgColor="#f0f9ff" pl="20" pr="20" pt="8" pb="8" w="full">
            <Text fontSize="2xl" w="full">
                Transfer
            </Text>
            <HStack w="full">
                <Text>Input an private address: </Text>
                <Input
                    value={privateAddress}
                    onChange={handlePrivateAddressChange}
                    placeholder="0x1234..."
                    w="42rem"
                    bgColor="white"
                />
            </HStack>
            <HStack w="full">
                <Text>Input the amount of wei: </Text>
                <Input
                    value={value}
                    onChange={handleValueChange}
                    placeholder="123..."
                    w="42rem"
                    bgColor="white"
                />
            </HStack>
            <Button bgColor="skyblue" onClick={transfer} isLoading={isLoading}>
                Transfer
            </Button>
        </VStack>
    )
}
