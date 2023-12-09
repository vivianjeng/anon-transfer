'use client'
import {
    Box,
    Button,
    Center,
    Flex,
    HStack,
    Input,
    Link,
    Spacer,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react'
import { UnlockIcon } from '@chakra-ui/icons'
const { Identity } = require('@semaphore-protocol/identity')
import { ethers } from 'ethers'
import { UserState } from '@unirep/core'
import prover from '@unirep/circuits/provers/web'
import { SetStateAction, useEffect, useState } from 'react'
import unirepAbi from '@unirep/contracts/abi/Unirep.json'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import {
    useGlobalContext,
    unirepAddress,
    appAddress,
    chainId,
} from '@/contexts/User'
import CardComponent from './Card'
import Transaction from './Transaction'

declare global {
    interface Window {
        ethereum?: any
    }
}

const MAX_VALUE = ((BigInt(1) << BigInt(64)) - BigInt(1)).toString()

export default function Withdraw() {
    const { isOpen, onToggle } = useDisclosure()
    const [txHash, setTxHash] = useState('')
    const { address, setAddress, signIn } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState('')
    const [ETHAddress, setETHAddress] = useState('')
    const [value, setValue] = useState('')
    // TODO: getData to compute balance
    const [pending, setPending] = useState('0')
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
            await userState.start()
            await userState.waitForSync()
            const currentEpoch = userState.sync.calcCurrentEpoch()
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            if (currentEpoch !== latestTransitionedEpoch) {
                const { publicSignals, proof, toEpoch } =
                    await userState.genUserStateTransitionProof()
                const data = unirep.interface.encodeFunctionData(
                    'userStateTransition',
                    [publicSignals, proof]
                )
                const tx = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: connectedAddress,
                            to: unirepAddress,
                            data: data,
                        },
                    ],
                })
                setTxHash(tx)
                onToggle()
                await provider.waitForTransaction(tx)
                window.localStorage.setItem(
                    'transitionEpoch',
                    toEpoch.toString()
                )
            }
            const revealNonce = true
            const epkNonce = 0
            const sigData = ETHAddress
            await userState.waitForSync()
            const { publicSignals, proof } =
                await userState.genProveReputationProof({
                    minRep: value as any,
                    revealNonce,
                    epkNonce,
                    data: sigData,
                })
            const data = app.interface.encodeFunctionData('withdraw', [
                ETHAddress,
                publicSignals,
                proof,
            ])
            const tx = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: address,
                        to: appAddress,
                        data: data,
                    },
                ],
            })
            setTxHash(tx)
            onToggle()
            userState.stop()
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
        try {
            if (!window.localStorage.getItem('userId')) return
            if (address === '') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                setAddress(accounts[0])
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const id = new Identity(window.localStorage.getItem('userId'))
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(appAddress),
                unirepAddress: unirepAddress,
            })
            await userState.start()
            await userState.waitForSync()
            const provable = await userState.getProvableData()
            const data = await userState.getData()
            setBalance((provable[0] - provable[1]).toString())
            setPending((data[0] - data[1]).toString())
            userState.stop()
            return data
        } catch (err: any) {
            window.alert(err.message)
        }
    }

    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => {
                onToggle()
            }, 3000)
            return () => clearTimeout(timeout)
        }
        getData()
    }, [isOpen])

    return (
        <CardComponent>
            <Transaction isOpen={isOpen} txHash={txHash} />
            <Text fontSize="2xl" w="full">
                Withdraw
            </Text>
            <HStack>
                <Box>Pending balance: {pending} wei</Box>
                <Spacer />
                <Box>Withdrawable balance: {balance} wei</Box>
                <Spacer />
                <Box textColor="red">
                    Max withdrawable capacity: {MAX_VALUE} wei{' '}
                    <Link
                        textColor="currentcolor"
                        isExternal
                        href="https://github.com/vivianjeng/anon-transfer/issues/8"
                    >
                        (See issue#8)
                    </Link>
                </Box>
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
