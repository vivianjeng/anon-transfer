import { Card, VStack } from '@chakra-ui/react'

export default function CardComponent({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Card w="full">
            <VStack
                bgColor="#f0f9ff"
                _dark={{ bgColor: '#002c49' }}
                p="5"
                w="full"
            >
                {children}
            </VStack>
        </Card>
    )
}
