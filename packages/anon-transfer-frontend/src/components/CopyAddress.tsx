
'use client'
import { Button, HStack, Input, InputProps, useClipboard } from '@chakra-ui/react'

export type CopyAddressProps = {
    address: string;
    disabled: boolean;
}

export default function CopyAddress({ address, disabled,...props }: CopyAddressProps & InputProps) {
    const { onCopy, hasCopied } = useClipboard(address)
    return (
        <HStack>
            <Input
                placeholder={address}
                content={address}
                disabled={true}
                color="black"
                _placeholder={{ color: 'black' }}
                _hover={{ cursor: 'text' }}
                cursor={'text'}
                {...props}
            />

            <Button onClick={onCopy} bgColor="skyblue" minWidth={50} isDisabled={ disabled}>
                {hasCopied ? 'copied!' : 'copy'}
            </Button>
        </HStack>
    )
}
