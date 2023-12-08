import {
    Button,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import { useRef } from 'react'

export type AlertComponentProps = {
    header: string
    body: string
    button: string
    onClose: () => void
    isOpen: boolean
}

export default function AlertDialogComponent({
    header,
    body,
    button,
    onClose,
    isOpen,
}: AlertComponentProps) {
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (
        <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogHeader>{header}</AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>{body}</AlertDialogBody>
                <AlertDialogFooter>
                    {/* <Button ref={cancelRef} onClick={onClose}>
                No
            </Button> */}
                    <Button colorScheme="red" ml={3} onClick={onClose}>
                        {button}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
