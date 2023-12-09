'use client'
import React, { useEffect, useState } from 'react'
import { Button, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import CopyAddress from './CopyAddress'
import { genEpochKey } from '@unirep/utils'
const { Identity } = require('@semaphore-protocol/identity')
import prover from '@unirep/circuits/provers/web'
import { UserState } from '@unirep/core'
import { ethers } from 'ethers'
import abi from '@unirep/contracts/abi/Unirep.json'
import { JsonRpcSigner } from '@ethersproject/providers'
import {
    appAddress,
    chainId,
    unirepAddress,
    useGlobalContext,
    culcEpoch,
} from '@/contexts/User'
import CardComponent from './Card'
import Transaction from './Transaction'
import { useUnirepUser } from '@/hooks/User'
import { useMetamask } from '@/hooks/Metamask'

export default function AddressList() {
    const { isOpen, onToggle } = useDisclosure()
    const { epoch, signIn } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [txHash, setTxHash] = useState('')
    const [epochKeys, setEpochKeys] = useState<string[]>([])
    const { userTransition } = useUnirepUser()
    const { connect } = useMetamask()

    const getData = () => {
        try {
            if (!window.localStorage.getItem('userId')) {
                setEpochKeys(new Array(3).fill('0x'))
                return
            }
            const id = new Identity(window.localStorage.getItem('userId'))
            const epks = new Array(3)
                .fill(0)
                .map(
                    (_, i) =>
                        '0x' +
                        genEpochKey(
                            id.secret,
                            appAddress,
                            culcEpoch(),
                            i,
                            BigInt(chainId)
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
            const signer = await connect()
            const id = new Identity(window.localStorage.getItem('userId'))
            const tx = await userTransition(id, signer as JsonRpcSigner)
            setTxHash(tx)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
            if (isOpen) {
                onToggle()
            }
        }
    }

    useEffect(() => {
        getData()
        if (isOpen) {
            const timeout = setTimeout(() => {
                onToggle()
            }, 3000)
            return () => clearTimeout(timeout)
        }
    }, [
        typeof window !== 'undefined'
            ? window.localStorage.getItem('userId')
            : undefined,
        isOpen,
    ])

    return (
        <CardComponent>
            <Transaction isOpen={isOpen} txHash={txHash} />
            <Text fontSize="2xl" w="full">
                My private addresses:
            </Text>
            {epochKeys.map((address, index) => (
                <CopyAddress
                    key={index}
                    address={address}
                    disabled={
                        typeof window !== 'undefined' &&
                        epoch !==
                            Number(
                                window.localStorage.getItem('transitionEpoch')
                            )
                    }
                    w="full"
                />
            ))}
            <Button
                colorScheme="blue"
                onClick={transition}
                isLoading={isLoading}
                isDisabled={
                    typeof window !== 'undefined' &&
                    epoch ===
                        Number(window.localStorage.getItem('transitionEpoch'))
                }
                rightIcon={<SettingsIcon />}
            >
                Transition
            </Button>
        </CardComponent>
    )
}
