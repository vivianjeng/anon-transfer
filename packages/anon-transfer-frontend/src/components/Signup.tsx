import {
    Button,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    Tooltip,
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { getUnirepContract } from '@unirep/contracts'
import abi from '@anon-transfer/contracts/abi/AnonTransfer.json'
import prover from '@unirep/circuits/provers/web'
import { Circuit, SignupProof } from '@unirep/circuits'
import { useEffect, useState } from 'react'
import { useGlobalContext } from '@/contexts/User'

const unirepAddress = '0xD91ca7eAB8ac0e37681362271DEB11a7fc4e0d4f'
const appAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'

const provider = new ethers.providers.Web3Provider(window.ethereum)
const app = new ethers.Contract(appAddress, abi, provider)

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

    const { userId, setUserId, address, setAddress } = useGlobalContext()

    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            setIsDisabled(true)
            setEmail(window.localStorage.getItem('email') ?? '')
            setPassword(window.localStorage.getItem('password') ?? '')
        }
    })
    const signup = async () => {
        setIsLoading(true)
        try {
            const secret = email + password
            const id = new Identity(secret)
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
            setUserId(secret)
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
                    <Button
                        h="1.75rem"
                        size="sm"
                        onClick={handleClick}
                        isDisabled={isDisabled}
                    >
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
            <Button
                colorScheme="blue"
                onClick={signup}
                isLoading={isLoading}
                isDisabled={isDisabled}
            >
                <Tooltip
                    placement="auto"
                    label="You already signed up."
                    isDisabled={!isDisabled}
                >
                    Signup
                </Tooltip>
            </Button>
        </HStack>
    )
}
