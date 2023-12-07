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
import { useGlobalContext } from '@/contexts/User'
import CardComponent from './Card'

declare global {
    interface Window {
        ethereum?: any
    }
}

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const appAddress = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
// const appAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'
const chainId = 11155111
// const chainId = 1337

export default function AddressList() {
    const { address, setAddress, epoch, setEpoch } = useGlobalContext()
    const [transitionEpoch, setTransitionEpoch] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [epochKeys, setEpochKeys] = useState<string[]>([])

    const getData = async () => {
        try {
            if (address === '') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
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
            console.log('getdata start')
            await userState.start()
            await userState.waitForSync()
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            userState.stop()
            return latestTransitionedEpoch
        } catch (err: any) {
            window.alert(err.message)
        }
    }

    const transition = async () => {
        setIsLoading(true)
        try {
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
            console.log('transition start')
            await userState.start()
            await userState.waitForSync()
            console.log(await userState.getData())
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
                        from: address,
                        to: unirepAddress,
                        data: data,
                    },
                ],
            })
            setTransitionEpoch(Number(toEpoch))
            userState.stop()
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getData().then((res) => {
            setTransitionEpoch(res || 0)
        })
    }, [])

    return (
        <CardComponent>
            <Text fontSize="2xl" w="full">
                My private addresses:
            </Text>
            {epochKeys.map((address, index) => (
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
