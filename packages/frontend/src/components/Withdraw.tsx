'use client'
import {
    Button,
    Center,
    Flex,
    HStack,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { UserState } from '@unirep/core'
import prover from '@unirep/circuits/provers/web'
import { SetStateAction, useEffect, useState } from 'react'
import unirepAbi from '@unirep/contracts/abi/Unirep.json'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { useGlobalContext } from '@/contexts/User'
import CardComponent from './Card'
const provider = new ethers.providers.Web3Provider(window.ethereum)

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const appAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'
const unirep = new ethers.Contract(unirepAddress, unirepAbi, provider)
const app = new ethers.Contract(appAddress, abi, provider)

export default function Withdraw() {
    const { userId, setUserId, address, setAddress } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState('')
    const [privateAddress, setPrivateAddress] = useState('')
    const [value, setValue] = useState('')
    // TODO: getData to compute balance
    const [balance, setBalance] = useState('0')
    const handlePrivateAddressChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setPrivateAddress(event.target.value)
    const handleValueChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setValue(event.target.value)

    const withdraw = async () => {
        setIsLoading(true)
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const id = new Identity(userId)
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(appAddress),
                unirepAddress: unirepAddress,
            })
            await userState.start()
            await userState.waitForSync()
            console.log(await userState.getData())
            const currentEpoch = userState.sync.calcCurrentEpoch()
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            if (currentEpoch !== latestTransitionedEpoch) {
                const { publicSignals, proof } =
                    await userState.genUserStateTransitionProof()
                const data = unirep.interface.encodeFunctionData(
                    'userStateTransition',
                    [publicSignals, proof]
                )
                await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: address,
                            to: unirepAddress,
                            data: data,
                        },
                    ],
                })
            }
            const revealNonce = true
            const epkNonce = 0
            const sigData = address
            const { publicSignals, proof } =
                await userState.genProveReputationProof({
                    minRep: Number(value),
                    revealNonce,
                    epkNonce,
                    data: sigData,
                })
            const data = app.interface.encodeFunctionData('withdraw', [
                privateAddress,
                publicSignals,
                proof,
            ])
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: address,
                        to: appAddress,
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

    const getData = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const id = new Identity(userId)
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(appAddress),
                unirepAddress: unirepAddress,
            })
            await userState.start()
            await userState.waitForSync()
            return userState.getData()
        } catch (err: any) {
            window.alert(err.message)
        }
    }

    useEffect(() => {
        getData().then((res) => {
            res && setData((res[0] - res[1]).toString())
        })
    }, [])

    return (
        <CardComponent>
            <Text fontSize="2xl" w="full">
                Withdraw
            </Text>
            <Text w="full">Pending balance: {balance} wei</Text>
            <HStack w="full">
                <Text w="250px">Input an ETH address:</Text>
                <Input
                    value={privateAddress}
                    onChange={handlePrivateAddressChange}
                    placeholder="0x1234..."
                    w="full"
                    bgColor="white"
                    textColor="black"
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
            <Button colorScheme="blue" onClick={withdraw} isLoading={isLoading}>
                Withdraw
            </Button>
        </CardComponent>
    )
}
