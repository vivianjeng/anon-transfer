'use client'
import React, { useEffect, useState } from 'react'
import { Button, Text, VStack } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import CopyAddress from './CopyAddress'
import { genEpochKey } from '@unirep/utils'
const { Identity } = require('@semaphore-protocol/identity')
import prover from '@unirep/circuits/provers/web'
import { UserState } from '@unirep/core'
import { ethers } from 'ethers'
import abi from '@unirep/contracts/abi/Unirep.json'
import {
    appAddress,
    chainId,
    unirepAddress,
    useGlobalContext,
} from '@/contexts/User'
import CardComponent from './Card'

declare global {
    interface Window {
        ethereum?: any
    }
}

export default function AddressList() {
    const { address, setAddress, epoch, setEpoch, signIn } = useGlobalContext()
    const [transitionEpoch, setTransitionEpoch] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [epochKeys, setEpochKeys] = useState<string[]>(['', '', ''])

    const getData = () => {
        try {
            if (window.localStorage.getItem('userId') === undefined) return
            const id = new Identity(window.localStorage.getItem('userId'))
            const epks = new Array(3)
                .fill(0)
                .map(
                    (_, i) =>
                        '0x' +
                        genEpochKey(
                            id.secret,
                            appAddress,
                            epoch,
                            i,
                            chainId
                        ).toString(16)
                )
            setEpochKeys(epks)
        } catch (err: any) {
            window.alert(err.message)
        }
    }

    const transition = async () => {
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
            const provider = new ethers.providers.Web3Provider(window?.ethereum)
            const unirep = new ethers.Contract(unirepAddress, abi, provider)
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
                        from: connectedAddress,
                        to: unirepAddress,
                        data: data,
                    },
                ],
            })
            window.localStorage.setItem('transitionEpoch', toEpoch.toString())
            setTransitionEpoch(Number(toEpoch))
            userState.stop()
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getData()
        if (window.localStorage.getItem('transitionEpoch') !== undefined)
            setTransitionEpoch(
                Number(window.localStorage.getItem('transitionEpoch'))
            )
    }, [epoch])

    return (
        <CardComponent>
            <Text fontSize="2xl" w="full">
                My private addresses:
            </Text>
            {signIn &&
                epochKeys.map((address, index) => (
                    <CopyAddress
                        key={index}
                        address={address}
                        disabled={epoch !== transitionEpoch}
                        w="full"
                    />
                ))}
            <Button
                colorScheme="blue"
                onClick={transition}
                isLoading={isLoading}
                rightIcon={<SettingsIcon />}
            >
                Transition
            </Button>
        </CardComponent>
    )
}
