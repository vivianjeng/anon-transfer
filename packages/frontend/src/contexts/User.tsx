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

export const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
// testnet
// export const chainId = '0x7a69'
// export const appAddress = '0x0B306BF915C4d645ff596e518fAf3F9669b97016'
// const startTimestamp = 1702604943
// const epochLength = 300
// v1
// export const chainId = '0xaa36a7'
// export const appAddress = '0xd1A79ed12B26bD12247536869d75E1A8555aF35F'
// const startTimestamp = 1701792432
// const epochLength = 300
// v2
export const chainId = '0xaa36a7'
export const appAddress = '0x7b485d3a3De5009BfCB435D275594C86370079f4'
const startTimestamp = 1702536036
const epochLength = 600

export function calcEpoch() {
    const timestamp = Math.floor(+new Date() / 1000)
    return Math.max(0, Math.floor((timestamp - startTimestamp) / epochLength))
}

export function remainingTime() {
    const timestamp = Math.floor(+new Date() / 1000)
    const currentEpoch = calcEpoch()
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
    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            setSignIn(true)
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
