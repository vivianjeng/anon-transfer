'use client'
import { Text, Box, HStack, Spacer, VStack } from '@chakra-ui/react'
import { TimeIcon } from '@chakra-ui/icons'
import React from 'react'

import { useEffect } from 'react'
import AddressList from './AddressList'
import Transfer from './Transfer'
import Withdraw from './Withdraw'
import { ethers } from 'ethers'
import { culcEpoch, remainingTime, useGlobalContext } from '@/contexts/User'

declare global {
    interface Window {
        ethereum?: any
    }
}

const message = 'Sign up for Anon Transfer'

export default function Wallet() {
    const { address, setAddress, epoch, setEpoch } = useGlobalContext()
    const [remaining, setRemaining] = React.useState(0)

    // window.ethereum.on('accountsChanged', handleAccountsChanged)

    useEffect(() => {
        const interval = setInterval(() => {
            setEpoch(culcEpoch())
            setRemaining(remainingTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const signMessage = async () => {
        try {
            if (typeof window !== undefined) {
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                )
                const signer = provider.getSigner()
                const signatureHash = await signer.signMessage(message)
                return signatureHash
            }
        } catch (err: any) {
            window.alert(err.message)
        }
    }
    function handleAccountsChanged(accounts: string | any[]) {
        if (accounts.length === 0) {
            console.log('Please connect to MetaMask.')
        } else {
            setAddress(accounts[0])
        }
    }

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts',
            })
            if (accounts.length !== 0) {
                setAddress(accounts[0])
                const signature = await signMessage()
            }

            try {
                const addressArray = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                const obj = {
                    status: '👆🏽 Write a message in the text-field above.',
                    address: addressArray[0],
                }
                setAddress(obj.address)
                const signature = await signMessage()
            } catch (err: any) {
                return {
                    address: '',
                    status: '😥 ' + err.message,
                }
            }
        } else {
            return {
                address: '',
                status: ' 🦊 You must install Metamask, a virtual Ethereum wallet, in your browser',
            }
        }
    }

    return (
        <VStack w="80%" pt={50}>
            <HStack w="full">
                <Text>Epoch: {epoch}</Text>
                <Spacer width="5rem"></Spacer>
                <TimeIcon />
                <Text>Epoch remaining time: {remaining}</Text>
            </HStack>
            <AddressList />
            <Transfer />
            <Withdraw />
            <Box h="100px" />
            {/* {userId && <AddressList epoch={epoch} />}
            {userId && <Transfer />}
            {userId && <Withdraw />} */}
        </VStack>
    )
}
