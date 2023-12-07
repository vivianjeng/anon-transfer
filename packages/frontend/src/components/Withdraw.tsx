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
import { UnlockIcon } from '@chakra-ui/icons'
const { Identity } = require('@semaphore-protocol/identity')
import { ethers } from 'ethers'
import { UserState } from '@unirep/core'
import prover from '@unirep/circuits/provers/web'
import { SetStateAction, useEffect, useState } from 'react'
import unirepAbi from '@unirep/contracts/abi/Unirep.json'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import { useGlobalContext, unirepAddress, appAddress } from '@/contexts/User'
import CardComponent from './Card'

declare global {
    interface Window {
        ethereum?: any
    }
}

export default function Withdraw() {
    const { address, setAddress } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState('')
    const [ETHAddress, setETHAddress] = useState('')
    const [value, setValue] = useState('')
    // TODO: getData to compute balance
    const [balance, setBalance] = useState('0')
    const handleETHAddressChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setETHAddress(event.target.value)
    const handleValueChange = (event: {
        target: { value: SetStateAction<string> }
    }) => setValue(event.target.value)

    const withdraw = async () => {
        setIsLoading(true)
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const unirep = new ethers.Contract(
                unirepAddress,
                unirepAbi,
                provider
            )
            const app = new ethers.Contract(appAddress, abi, provider)
            if (!window.localStorage.getItem('userId')) return
            const id = new Identity(window.localStorage.getItem('userId'))
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(appAddress),
                unirepAddress: unirepAddress,
            })
            console.log('withdraw widraw start')
            await userState.start()
            await userState.waitForSync()
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
            const sigData = ETHAddress
            const { publicSignals, proof } =
                await userState.genProveReputationProof({
                    minRep: Number(value),
                    revealNonce,
                    epkNonce,
                    data: sigData,
                })
            const data = app.interface.encodeFunctionData('withdraw', [
                ETHAddress,
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
            userState.stop()
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setValue('')
            setETHAddress('')
            setIsLoading(false)
        }
    }

    const getData = async () => {
        try {
            if (address === '') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                setAddress(accounts[0])
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            if (!window.localStorage.getItem('userId')) return
            const id = new Identity(window.localStorage.getItem('userId'))
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(appAddress),
                unirepAddress: unirepAddress,
            })
            console.log('withdraw getdata start')
            await userState.start()
            await userState.waitForSync()
            const data = await userState.getData()
            userState.stop()
            return data
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
                    value={ETHAddress}
                    onChange={handleETHAddressChange}
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
