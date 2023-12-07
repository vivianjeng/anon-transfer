import {
    HStack,
    Text,
    IconButton,
    InputGroup,
    Input,
    InputRightElement,
    useClipboard,
} from '@chakra-ui/react'
import { ExternalLinkIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons'
import { appAddress } from '@/contexts/User'

export default function ContractInfo() {
    const { onCopy, hasCopied } = useClipboard(appAddress)
    const handleClick = () => {
        window.open(
            `https://sepolia.etherscan.io/address/${appAddress}`,
            '_blank'
        )
    }

    return (
        <HStack>
            <Text>Sepolia Contract Address</Text>
            <InputGroup size="md" w="200">
                <Input
                    w="40"
                    pr="4.5rem"
                    value={appAddress}
                    placeholder={appAddress}
                    defaultValue={appAddress}
                />
                <InputRightElement width="4.5rem">
                    {hasCopied ? (
                        <IconButton
                            bgColor="white"
                            _dark={{ bgColor: 'gray.800' }}
                            h="1.75rem"
                            size="sm"
                            aria-label="Search database"
                            onClick={onCopy}
                            icon={<CheckIcon />}
                        />
                    ) : (
                        <IconButton
                            bgColor="white"
                            _dark={{ bgColor: 'gray.800' }}
                            h="1.75rem"
                            size="sm"
                            aria-label="Search database"
                            onClick={onCopy}
                            icon={<CopyIcon />}
                        />
                    )}
                </InputRightElement>
            </InputGroup>
            <IconButton
                h="1.75rem"
                size="sm"
                aria-label="Search database"
                onClick={handleClick}
                icon={<ExternalLinkIcon />}
            />
        </HStack>
    )
}
