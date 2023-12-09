'use client'
import { useGlobalContext } from '@/contexts/User'
import {
    Button,
    HStack,
    Input,
    InputProps,
    useClipboard,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react'
import AlertDialogComponent from './AlertDialog'
import { useRef } from 'react'

export type CopyAddressProps = {
    address: string
    disabled: boolean
}

export default function CopyAddress({
    address,
    disabled,
    ...props
}: CopyAddressProps & InputProps) {
    const { epoch, setEpoch } = useGlobalContext()
    const { onCopy, hasCopied } = useClipboard(address)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<HTMLButtonElement>(null)

    function handleCopy() {
        onCopy()
        onOpen()
    }

    return (
        <HStack w="full">
            <Input
                value={address}
                placeholder={address}
                content={address}
                cursor={'text'}
                textColor="black"
                bgColor="white"
                isDisabled={disabled}
                _dark={{ bgColor: 'white' }}
                {...props}
            />

            <Button
                onClick={handleCopy}
                colorScheme="blue"
                minWidth={50}
                isDisabled={disabled}
            >
                <Tooltip
                    placement="auto"
                    label={
                        typeof window !== 'undefined' &&
                        window.localStorage.getItem('userId') !== null
                            ? 'Transition is required.'
                            : 'Please log in first.'
                    }
                    isDisabled={!disabled}
                >
                    {hasCopied ? 'copied!' : 'copy'}
                </Tooltip>
            </Button>
            <AlertDialogComponent
                header=""
                body={`This private address will only be valid for epoch ${epoch}`}
                button="I understand"
                onClose={onClose}
                isOpen={isOpen}
            />
        </HStack>
    )
}
