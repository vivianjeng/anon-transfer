'use client'
import {
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    useState,
} from 'react'

interface ContextProps {
    userId: string
    setUserId: Dispatch<SetStateAction<string>>
    address: string
    setAddress: Dispatch<SetStateAction<string>>
}

const GlobalContext = createContext<ContextProps>({
    userId: '',
    setUserId: (): string => '',
    address: '',
    setAddress: (): string => '',
})

import { ReactNode } from 'react'

export const GlobalContextProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    const [userId, setUserId] = useState('')
    const [address, setAddress] = useState('')

    return (
        <GlobalContext.Provider
            value={{ userId, setUserId, address, setAddress }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)
