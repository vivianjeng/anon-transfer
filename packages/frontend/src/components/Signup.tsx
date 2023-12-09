import {
    Button,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    IconButton,
    Tooltip,
    StackProps,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ButtonGroup,
} from '@chakra-ui/react'
import { JsonRpcSigner } from '@ethersproject/providers'
import { ViewOffIcon, ViewIcon } from '@chakra-ui/icons'
const { Identity } = require('@semaphore-protocol/identity')
import { useEffect, useState } from 'react'
import { useGlobalContext } from '@/contexts/User'
import { useMetamask } from '@/hooks/Metamask'
import { useUnirepUser } from '@/hooks/User'
import { searchUser } from './utils'
import Transaction from './Transaction'

export default function Signup({ ...props }: StackProps) {
    const { isOpen, onToggle } = useDisclosure()
    const [isLoading, setIsLoading] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [txHash, setTxHash] = useState('')
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { connect } = useMetamask()
    const { userSignup } = useUnirepUser()

    const handleClick = () => setShow(!show)
    const handleEmailChange = (event: { target: { value: string } }) =>
        setEmail(event.target.value)
    const handlePasswordChange = (event: { target: { value: string } }) =>
        setPassword(event.target.value)

    const { setSignIn } = useGlobalContext()

    useEffect(() => {
        if (
            window.localStorage.getItem('email') !== null &&
            window.localStorage.getItem('password') !== null
        ) {
            setIsDisabled(true)
            setEmail(window.localStorage.getItem('email') ?? '')
            setPassword(window.localStorage.getItem('password') ?? '')
            setSignIn(true)
        }
        if (isOpen) {
            const timeout = setTimeout(() => {
                onToggle()
            }, 3000)
            return () => clearTimeout(timeout)
        }
    }, [isLoading, isDisabled, isOpen])

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

    const login = async () => {
        setIsLoading(true)
        try {
            const secret = email + password
            const id = new Identity(secret)
            const length = await searchUser(id.commitment)
            if (length === 0) {
                const currentSigner = await connect()
                const tx = await userSignup(id, currentSigner as JsonRpcSigner)
                setTxHash(tx)
                onToggle()
            }
            window.localStorage.setItem('email', email)
            window.localStorage.setItem('password', password)
            window.localStorage.setItem('userId', secret)
            setIsDisabled(true)
            setSignIn(true)
            setIsModalOpen(false)
        } catch (err: any) {
            window.alert(err.message)
        } finally {
            setIsLoading(false)
            if (isOpen) {
                onToggle()
            }
        }
    }
    return (
        <>
            <Transaction isOpen={isOpen} txHash={txHash} />
            <HStack {...props}>
                {isDisabled ? (
                    <>
                        <Text>
                            Hello,{' '}
                            {email.indexOf('@') === -1
                                ? email
                                : email.slice(0, email.indexOf('@'))}
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
                    <Button
                        colorScheme="blue"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Connect
                    </Button>
                )}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                >
                    <ModalOverlay />

                    <ModalContent p={5}>
                        <ModalHeader p={6} alignItems={'center'}>
                            {' '}
                            Login{' '}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text fontWeight={600}> Email: </Text>
                            <InputGroup paddingBottom={5} size="md" width="30">
                                <Input
                                    p={3}
                                    w="30"
                                    onChange={handleEmailChange}
                                    value={email}
                                    isDisabled={isDisabled}
                                />
                            </InputGroup>
                            <Text fontWeight={600}>Password: </Text>
                            <InputGroup paddingBottom={5} size="md" width="30">
                                <Input
                                    pr="4.5rem"
                                    type={show ? 'text' : 'password'}
                                    onChange={handlePasswordChange}
                                    value={password}
                                    isDisabled={isDisabled}
                                />
                                <br />
                                <br />
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
                            <ButtonGroup>
                                <Button
                                    colorScheme="blue"
                                    onClick={login}
                                    isLoading={isLoading}
                                >
                                    <Tooltip
                                        placement="auto"
                                        label="You already signed in."
                                        isDisabled={!isDisabled}
                                    >
                                        Log In
                                    </Tooltip>
                                </Button>
                            </ButtonGroup>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </HStack>
        </>
    )
}
