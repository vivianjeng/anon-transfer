'use client'
import {
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    useState,
    ReactNode,
    useEffect,
} from 'react'
import detectEthereumProvider from '@metamask/detect-provider'

interface ContextProps {
    signIn: boolean
    setSignIn: Dispatch<SetStateAction<boolean>>
    address: string
    setAddress: Dispatch<SetStateAction<string>>
    epoch: number
    setEpoch: Dispatch<SetStateAction<number>>
}

const GlobalContext = createContext<ContextProps>({
    signIn: false,
    setSignIn: (): boolean => false,
    address: '',
    setAddress: (): string => '',
    epoch: 0,
    setEpoch: (): number => 0,
})

const startTimestamp = 1701792432
const epochLength = 300
export const chainId = '0xaa36a7'
// export const chainId = 31337
export const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
export const appAddress = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
// export const appAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'

export function culcEpoch() {
    const timestamp = Math.floor(+new Date() / 1000)
    return Math.max(0, Math.floor((timestamp - startTimestamp) / epochLength))
}

export function remainingTime() {
    const timestamp = Math.floor(+new Date() / 1000)
    const currentEpoch = culcEpoch()
    const epochEnd = startTimestamp + (currentEpoch + 1) * epochLength
    return Math.max(0, epochEnd - timestamp)
}

export const GlobalContextProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    const [signIn, setSignIn] = useState<boolean>(false)
    const [address, setAddress] = useState('')
    const [epoch, setEpoch] = useState(0)
    const initialState = { accounts: [] }
    const [wallet, setWallet] = useState(initialState)

    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            setSignIn(true)
        }

        const updateWallet = async (accounts: any) => {
            setWallet({ accounts })
        }

        const refreshAccounts = (accounts: any) => {
            if (accounts.length > 0) {
                updateWallet(accounts)
            } else {
                // if length 0, user is disconnected
                setWallet(initialState)
            }
        }

        const getProvider = async () => {
            const provider = await detectEthereumProvider({ silent: true })

            if (provider) {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                })
                setAddress(accounts[0])
                window.ethereum.on('accountsChanged', refreshAccounts)
            }
        }

        getProvider()
        return () => {
            window.ethereum?.removeListener('accountsChanged', refreshAccounts)
        }
    }, [])

    return (
        <GlobalContext.Provider
            value={{ signIn, setSignIn, address, setAddress, epoch, setEpoch }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)
