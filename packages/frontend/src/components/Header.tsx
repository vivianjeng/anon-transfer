import { HStack, Spacer, Text } from '@chakra-ui/react'
import Signup from './Signup'

export default function Header() {
    return (
        <HStack w="full" p={4} pb={0} pt={3}>
            <Text textAlign="left" fontSize={20}>
                Anon Transfer
            </Text>
            <Spacer width="auto"></Spacer>
            <Signup />
        </HStack>
    )
}
