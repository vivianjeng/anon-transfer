'use client'
import {
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    useState,
    ReactNode,
} from 'react'

interface ContextProps {
    userId: string
    setUserId: Dispatch<SetStateAction<string>>
    address: string
    setAddress: Dispatch<SetStateAction<string>>
    epoch: number
    setEpoch: Dispatch<SetStateAction<number>>
}

const GlobalContext = createContext<ContextProps>({
    userId: '',
    setUserId: (): string => '',
    address: '',
    setAddress: (): string => '',
    epoch: 0,
    setEpoch: (): number => 0,
})

const startTimestamp = 1701792432
// const startTimestamp = 1701806259
const epochLength = 300

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
    const [userId, setUserId] = useState('')
    const [address, setAddress] = useState('')
    const [epoch, setEpoch] = useState(0)

    return (
        <GlobalContext.Provider
            value={{ userId, setUserId, address, setAddress, epoch, setEpoch }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)
