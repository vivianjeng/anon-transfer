import * as ethers from 'ethers'
import {
    ExternalProvider,
    JsonRpcSigner,
    Web3Provider,
} from '@ethersproject/providers'
import { useState } from 'react'
import { chainId } from '@/contexts/User'

declare global {
    interface Window {
        ethereum: ExternalProvider
    }
}

type ExtensionForProvider = {
    on: (event: string, callback: (...params: any) => void) => void
}

// Adds on stream support for listening events.
// see https://github.com/ethers-io/ethers.js/discussions/3230
type GenericProvider = ExternalProvider & ExtensionForProvider

interface ProviderRpcError extends Error {
    message: string
    code: number
    data?: unknown
}

export function useMetamask() {
    const [provider, setProvider] = useState<Web3Provider | null>(null)
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
    const [accounts, setAccounts] = useState<string[]>([])

    const setupProvider = () => {
        if (!window.ethereum) throw Error('Could not find Metamask extension')
        if (provider) return provider

        const newProvider = new Web3Provider(window.ethereum)
        listenToEvents(newProvider)
        setProvider(newProvider)

        return newProvider
    }

    const listenToEvents = (provider: Web3Provider) => {
        ;(window.ethereum as GenericProvider).on(
            'accountsChanged',
            (acc: string[]) => {
                setAccounts(acc)
            }
        )
        ;(window.ethereum as GenericProvider).on(
            'disconnect',
            (error: ProviderRpcError) => {
                throw Error(error.message)
            }
        )
        ;(window.ethereum as GenericProvider).on(
            'chainChanged',
            (chainId: string) => {
                console.log('chainChanged', chainId)
                const newProvider = new Web3Provider(window.ethereum)
                setProvider(newProvider)
            }
        )
    }

    const connect = async () => {
        let currentProvider = setupProvider()
        const accounts: string[] = await currentProvider.send(
            'eth_requestAccounts',
            []
        )
        const network = await currentProvider.getNetwork()
        if (BigInt(network.chainId ?? 0) !== BigInt(chainId)) {
            const params = [
                {
                    chainId: chainId,
                },
            ]
            await currentProvider.send('wallet_switchEthereumChain', params)
            currentProvider = setupProvider()
        }
        const signer: JsonRpcSigner = currentProvider.getSigner()
        setAccounts(accounts)
        setSigner(signer)
        return signer
    }

    const getAccounts = async () => {
        const provider = setupProvider()
        const accounts: string[] = await provider.send('eth_accounts', [])
        setAccounts(accounts)
        return accounts
    }

    const sendTransaction = async (
        from: string,
        to: string,
        valueInEther: string
    ) => {
        const provider = setupProvider()
        const params = [
            {
                from,
                to,
                value: ethers.utils
                    .parseUnits(valueInEther, 'ether')
                    .toHexString(),
            },
        ]
        const transactionHash = await provider.send(
            'eth_sendTransaction',
            params
        )
        return transactionHash
    }

    return {
        signer,
        accounts,
        connect,
        getAccounts,
        sendTransaction,
    }
}
