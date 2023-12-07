import { HStack, Spacer, Text } from '@chakra-ui/react'
import Signup from './Signup'
import ContractInfo from './ContractInfo'

export default function Header() {
    return (
        <HStack
            zIndex="1"
            justifyContent="space-between"
            position="fixed"
            top="0"
            w="full"
            p={4}
            bgColor="white"
            _dark={{ bgColor: '#1A202C' }}
        >
            <Text textAlign="left" fontSize={20}>
                Anon Transfer
            </Text>
            <Spacer width="auto"></Spacer>
            <ContractInfo />
            <Spacer width="auto"></Spacer>
            <Signup />
        </HStack>
    )
}
