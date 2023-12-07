'use client'
import { useGlobalContext } from '@/contexts/User'
import {
    Button,
    HStack,
    Input,
    InputProps,
    useClipboard,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Tooltip,
} from '@chakra-ui/react'
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
                    label="Transition is required."
                    isDisabled={!disabled}
                >
                    {hasCopied ? 'copied!' : 'copy'}
                </Tooltip>
            </Button>
            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>
                        Use this private address carefully
                    </AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        This private address will only be valid for epoch{' '}
                        {epoch}.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        {/* <Button ref={cancelRef} onClick={onClose}>
                            No
                        </Button> */}
                        <Button colorScheme="red" ml={3} onClick={onClose}>
                            I understand
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </HStack>
    )
}
