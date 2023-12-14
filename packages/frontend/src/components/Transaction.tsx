import {
    Alert,
    AlertIcon,
    Box,
    Link,
    SlideFade,
    Flex,
    Text,
    Spacer,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export default function Transaction({
    isOpen,
    txHash,
}: {
    isOpen: boolean
    txHash: string
}) {
    return (
        <Box position="fixed" bottom="100px" zIndex="1" hidden={!isOpen}>
            <SlideFade in={isOpen} offsetY="20px">
                <Box
                    // p="40px"
                    color="white"
                    mt="4"
                    rounded="md"
                    shadow="md"
                >
                    <Alert
                        status="success"
                        opacity="1"
                        zIndex="1"
                        bgColor="green"
                        rounded={8}
                    >
                        <AlertIcon opacity="1" color="white" />
                        <Link
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            isExternal
                        >
                            <Flex>
                                <Text>Transaction submitted </Text>
                                <Spacer pr="10" w="full" />
                                <Text>
                                    View your transaction on etherscan
                                    <ExternalLinkIcon pl="2px" pb="2px" />
                                </Text>
                            </Flex>
                        </Link>
                    </Alert>
                </Box>
            </SlideFade>
        </Box>
    )
}
