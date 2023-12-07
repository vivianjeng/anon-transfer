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

    const { address, setAddress } = useGlobalContext()

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
    })

    const signin = async () => {
        setIsLoading(true)
        try {
            const secret = email + password
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('password', password)
            window.localStorage.setItem('userId', secret)
            setIsDisabled(true)
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
            if (address === '') {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                setAddress(accounts[0])
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum)
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
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('password', password)
            window.localStorage.setItem('userId', secret)
            setIsDisabled(true)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <HStack>
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
            <Button
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
            </Button>
        </HStack>
    )
}
