'use client'
import { Text, Button, HStack, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

import { useEffect } from 'react'
import AddressList from './AddressList'
import Transfer from './Transfer'
import Withdraw from './Withdraw'
import Signup from './Signup'
import { ethers } from 'ethers'
import { culcEpoch, remainingTime, useGlobalContext } from '@/contexts/User'

declare global {
    interface Window {
        ethereum?: any
    }
}

// const address = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const address = '0x9A676e781A523b5d0C0e43731313A708CB607508'
const message = 'Sign up for Anon Transfer'

export default function Wallet() {
    const { userId, setUserId, address, setAddress, epoch, setEpoch } =
        useGlobalContext()
    const [remaining, setRemaining] = React.useState(0)

    window.ethereum.on('accountsChanged', handleAccountsChanged)

    useEffect(() => {
        const interval = setInterval(() => {
            setEpoch(culcEpoch())
            setRemaining(remainingTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const signMessage = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const signatureHash = await signer.signMessage(message)
            return signatureHash
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
                setUserId(signature || '')
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
                setUserId(signature || '')
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
        <VStack>
            <HStack w="full">
                <Text textAlign="left" fontSize={20}>
                    Anon Transfer
                </Text>
                <Spacer width="auto"></Spacer>
                <Signup />
            </HStack>
            <HStack w="full">
                <Text>Epoch: {epoch}</Text>
                <Spacer width="5rem"></Spacer>
                <Text>Epoch remaining time: {remaining}</Text>
            </HStack>
            <AddressList />
            <Transfer />
            <Withdraw />
            {/* {userId && <AddressList epoch={epoch} />}
            {userId && <Transfer />}
            {userId && <Withdraw />} */}
        </VStack>
    )
}
