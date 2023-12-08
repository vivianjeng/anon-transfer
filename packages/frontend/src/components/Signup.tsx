import {
    Button,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    IconButton,
    Tooltip,
} from '@chakra-ui/react'
import { ViewOffIcon, ViewIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
const { Identity } = require('@semaphore-protocol/identity')
import { getUnirepContract } from '@unirep/contracts'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import prover from '@unirep/circuits/provers/web'
import { Circuit, SignupProof } from '@unirep/circuits'
import { useEffect, useState } from 'react'
import { useGlobalContext, appAddress, unirepAddress } from '@/contexts/User'

declare global {
    interface Window {
        ethereum?: any
    }
}

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const handleClick = () => setShow(!show)
    const handleEmailChange = (event: { target: { value: string } }) =>
        setEmail(event.target.value)
    const handlePasswordChange = (event: { target: { value: string } }) =>
        setPassword(event.target.value)

    const { address, setAddress, signIn, setSignIn } = useGlobalContext()

    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            setIsDisabled(true)
            setEmail(window.localStorage.getItem('email') ?? '')
            setPassword(window.localStorage.getItem('password') ?? '')
            window.localStorage.setItem('userId', email + password)
        }
    }, [isLoading, isDisabled])

    const searchUser = async (commitment: bigint) => {
        const query = `
        {
        users(
            where: {
                attesterId: "${BigInt(appAddress).toString()}", 
                commitment: "${BigInt(commitment).toString()}"
            }) {
                epoch
            }
        }`
        const url = `https://api.studio.thegraph.com/query/48080/sepolia/v2.0.0-beta-5`
        const res = await fetch(url, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                query: query,
            }),
        })
        if (!res.ok) throw new Error(`Subgraph error: ${JSON.stringify(res)}`)
        const length = (await res.json()).data.users.length
        return length
    }

    const signout = async () => {
        setIsLoading(true)
        try {
            window.localStorage.clear()
            setIsDisabled(false)
            setSignIn(false)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const signin = async () => {
        setIsLoading(true)
        try {
            const id = new Identity(email + password)
            const length = await searchUser(id.commitment)
            if (length === 0) throw new Error('User not found. Should sign up first.')
            const secret = email + password
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('password', password)
            window.localStorage.setItem('userId', secret)
            setIsDisabled(true)
            setSignIn(true)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const signup = async () => {
        setIsLoading(true)
        try {
            const secret = email + password
            const id = new Identity(secret)
            const length = await searchUser(id.commitment)
            if (length === 0) {
                if (address === '') {
                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts',
                    })
                    setAddress(accounts[0])
                }
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                )
                const app = new ethers.Contract(appAddress, abi, provider)
                const unirep = getUnirepContract(unirepAddress, provider)
                const epoch = await unirep.attesterCurrentEpoch(appAddress)
                const { chainId } = await provider.getNetwork()
                const circuitInputs = {
                    identity_secret: id.secret,
                    epoch: epoch,
                    attester_id: appAddress,
                    chain_id: chainId,
                }
                const signupProof = await prover.genProofAndPublicSignals(
                    Circuit.signup,
                    circuitInputs
                )
                const { publicSignals, proof } = new SignupProof(
                    signupProof.publicSignals,
                    signupProof.proof
                )
                const data = app.interface.encodeFunctionData('userSignUp', [
                    publicSignals,
                    proof,
                ])
                await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: address,
                            to: appAddress,
                            data: data,
                        },
                    ],
                })
            }
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('password', password)
            window.localStorage.setItem('userId', secret)
            setIsDisabled(true)
            setSignIn(true)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <HStack>
            {isDisabled ? (
                <>
                    <Text>
                        Hello,{' '}
                        {email.indexOf('@') === -1
                            ? email
                            : email.slice(email.indexOf('@'))}
                    </Text>
                    <Button
                        colorScheme="blue"
                        onClick={signout}
                        isLoading={isLoading}
                    >
                        Sign Out
                    </Button>
                </>
            ) : (
                <>
                    <Text>email: </Text>
                    <Input
                        w="30"
                        onChange={handleEmailChange}
                        value={email}
                        isDisabled={isDisabled}
                    />
                    <Text>password: </Text>
                    <InputGroup size="md" width="30">
                        <Input
                            pr="4.5rem"
                            type={show ? 'text' : 'password'}
                            onChange={handlePasswordChange}
                            value={password}
                            isDisabled={isDisabled}
                        />
                        <InputRightElement width="4.5rem">
                            {show ? (
                                <IconButton
                                    h="1.75rem"
                                    size="sm"
                                    aria-label="Search database"
                                    isDisabled={isDisabled}
                                    onClick={handleClick}
                                    icon={<ViewOffIcon />}
                                />
                            ) : (
                                <IconButton
                                    h="1.75rem"
                                    size="sm"
                                    aria-label="Search database"
                                    isDisabled={isDisabled}
                                    onClick={handleClick}
                                    icon={<ViewIcon />}
                                />
                            )}
                        </InputRightElement>
                    </InputGroup>
                    <Button onClick={signin} isLoading={isLoading}>
                        <Tooltip
                            placement="auto"
                            label="You already signed in."
                            isDisabled={!isDisabled}
                        >
                            Sign In
                        </Tooltip>
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={signup}
                        isLoading={isLoading}
                    >
                        <Tooltip
                            placement="auto"
                            label="You already signed in."
                            isDisabled={!isDisabled}
                        >
                            Sign Up
                        </Tooltip>
                    </Button>
                </>
            )}
            {/* <Button
                onClick={signin}
                isLoading={isLoading}
                isDisabled={isDisabled}
            >
                <Tooltip
                    placement="auto"
                    label="You already signed in."
                    isDisabled={!isDisabled}
                >
                    Sign In
                </Tooltip>
            </Button>
            <Button
                colorScheme="blue"
                onClick={signup}
                isLoading={isLoading}
                isDisabled={isDisabled}
            >
                <Tooltip
                    placement="auto"
                    label="You already signed in."
                    isDisabled={!isDisabled}
                >
                    Sign Up
                </Tooltip>
            </Button> */}
        </HStack>
    )
}
