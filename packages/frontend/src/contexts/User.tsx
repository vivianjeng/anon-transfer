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

interface ContextProps {
    address: string
    setAddress: Dispatch<SetStateAction<string>>
    epoch: number
    setEpoch: Dispatch<SetStateAction<number>>
}

const GlobalContext = createContext<ContextProps>({
    address: '',
    setAddress: (): string => '',
    epoch: 0,
    setEpoch: (): number => 0,
})

const startTimestamp = 1701792432
// const startTimestamp = 1701806259
const epochLength = 300
export const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
export const appAddress = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
// const appAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'

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
    const [address, setAddress] = useState('')
    const [epoch, setEpoch] = useState(0)

    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            const storageEmail = window.localStorage.getItem('email')
            const storagePassword = window.localStorage.getItem('password')
            const storageUserId =
                window.localStorage.getItem('userId') ??
                (storageEmail ?? '') + (storagePassword ?? '')
            window.localStorage.setItem('userId', storageUserId)
        }
    }, [])

    return (
        <GlobalContext.Provider
            value={{ address, setAddress, epoch, setEpoch }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)
