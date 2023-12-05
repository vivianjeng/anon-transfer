'use client'
import React, { useEffect, useState } from 'react'
import { Button, Text, VStack } from '@chakra-ui/react'
import CopyAddress from './CopyAddress'
import { genEpochKey } from '@unirep/utils'
import { Identity } from '@semaphore-protocol/identity'
import prover from '@unirep/circuits/provers/web'
import { UserState } from '@unirep/core'
import { ethers } from 'ethers'
import abi from '@unirep/contracts/abi/Unirep.json'

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const address = '0x9A676e781A523b5d0C0e43731313A708CB607508'
// const chainId = 11155111
const chainId = 1337
const provider = new ethers.providers.Web3Provider(window.ethereum)
const unirep = new ethers.Contract(unirepAddress, abi, provider)

export type AddressListProps = {
    from: string
    semaphoreIdentity: string
    epoch: number
}

export default function AddressList({
    from,
    semaphoreIdentity,
    epoch,
}: AddressListProps) {
    const [transitionEpoch, setTransitionEpoch] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const identity = new Identity(semaphoreIdentity)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const id = new Identity(semaphoreIdentity)
    const userState = new UserState({
        id: id,
        prover: prover,
        provider: provider,
        attesterId: BigInt(address),
        unirepAddress: unirepAddress,
    })
    const epochKeys = new Array(3)
        .fill(0)
        .map(
            (_, i) =>
                '0x' +
                genEpochKey(
                    identity.secret,
                    address,
                    epoch,
                    i,
                    chainId
                ).toString(16)
        )

    const getData = async () => {
        try {
            await userState.start()
            await userState.waitForSync()
            console.log(await userState.latestTransitionedEpoch())
            return userState.latestTransitionedEpoch()
        } catch (err: any) {
            window.alert(err.message)
        }
    }

    const transition = async () => {
        setIsLoading(true)
        try {
            await userState.start()
            await userState.waitForSync()
            console.log(await userState.latestTransitionedEpoch())
            console.log('finish syncing')
            const { publicSignals, proof, toEpoch } =
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
            setTransitionEpoch(Number(toEpoch))
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getData().then((res) => {
            console.log(res, epoch)
            setTransitionEpoch(res || 0)
        })
    }, [])

    return (
        <VStack bgColor="#f0f9ff" pl="20" pr="20" pt="8" pb="8" w="full">
            <Text fontSize="2xl" w="full">
                My private addresses:
            </Text>
            {epochKeys.map((address, index) => (
                <CopyAddress
                    key={index}
                    address={address}
                    disabled={epoch !== transitionEpoch}
                    w="42rem"
                />
            ))}
            <Button
                bgColor="skyblue"
                onClick={transition}
                isLoading={isLoading}
            >
                Transition
            </Button>
        </VStack>
    )
}
