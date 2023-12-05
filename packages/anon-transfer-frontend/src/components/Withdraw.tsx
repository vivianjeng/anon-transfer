'use client'
import { Button, HStack, Input, Text, VStack } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { UserState } from '@unirep/core'
import prover from '@unirep/circuits/provers/web'
import { SetStateAction, useEffect, useState } from 'react'
import unirepAbi from '@unirep/contracts/abi/Unirep.json'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
const provider = new ethers.providers.Web3Provider(window.ethereum)

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const address = '0x9A676e781A523b5d0C0e43731313A708CB607508'
const unirep = new ethers.Contract(unirepAddress, unirepAbi, provider)
const app = new ethers.Contract(address, abi, provider)

export type WithdrawProps = {
    semaphoreIdentity: string
    from: string
}

export default function Withdraw({ semaphoreIdentity, from }: WithdrawProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState('')
    const [privateAddress, setPrivateAddress] = useState('')
    const [value, setValue] = useState('')
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
            const id = new Identity(semaphoreIdentity)
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(address),
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
                            from: from,
                            to: unirepAddress,
                            data: data,
                        },
                    ],
                })
            }
            const revealNonce = true
            const epkNonce = 0
            const sigData = from
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
                        from: from,
                        to: address,
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
            const id = new Identity(semaphoreIdentity)
            const userState = new UserState({
                id: id,
                prover: prover,
                provider: provider,
                attesterId: BigInt(address),
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
        <VStack bgColor="#f0f9ff" pl="20" pr="20" pt="8" pb="8" w="full">
            <Text fontSize="2xl" w="full">
                Withdraw
            </Text>
            <Text>Pending balance: {data}</Text>
            <HStack w="full">
                <Text>Input an ETH address: </Text>
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
            <Button bgColor="skyblue" onClick={withdraw} isLoading={isLoading}>
                Withdraw
            </Button>
        </VStack>
    )
}
