import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerOverlay,
    HStack,
    IconButton,
    Spacer,
    Text,
    VStack,
    useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import Signup from './Signup'
import ContractInfo from './ContractInfo'
import ColorMode from './ColorMode'
import Footer from './Footer'

export default function Header() {
    const { isOpen, onOpen, onClose } = useDisclosure()
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="0 0 500 500"
                width="32px"
                height="32px"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                fillRule="evenodd"
                clipRule="evenodd"
            >
                <g>
                    <path
                        opacity="0.994"
                        fill="currentColor"
                        d="M 233.5,15.5 C 335.661,10.9856 413.161,51.9856 466,138.5C 497.405,197.812 504.072,259.812 486,324.5C 459.5,405.667 405.667,459.5 324.5,486C 241.357,508.173 166.357,492.507 99.5,439C 32.2092,377.81 5.37587,301.977 19,211.5C 37.0392,127.475 85.2058,67.9747 163.5,33C 186.179,23.9968 209.513,18.1635 233.5,15.5 Z M 222.5,145.5 C 223.496,160.658 223.83,175.991 223.5,191.5C 271.5,191.5 319.5,191.5 367.5,191.5C 367.5,207.5 367.5,223.5 367.5,239.5C 293.166,239.667 218.833,239.5 144.5,239C 170.627,207.895 196.627,176.728 222.5,145.5 Z M 143.5,271.5 C 217.834,271.333 292.167,271.5 366.5,272C 340.452,303.259 314.286,334.426 288,365.5C 287.5,350.17 287.333,334.837 287.5,319.5C 239.5,319.5 191.5,319.5 143.5,319.5C 143.5,303.5 143.5,287.5 143.5,271.5 Z"
                    />
                </g>
            </svg>
            <Text textAlign="left" fontSize={20}>
                Anon Transfer
            </Text>
            <Spacer />

            <Signup display={{ base: 'none', md: 'flex' }} />
            <ContractInfo />
            <ColorMode />
            <IconButton
                // px="0 !important"
                onClick={onOpen}
                display={{ base: 'block', md: 'none' }}
                aria-label="Menu"
                // variant="unstyled"
                icon={<HamburgerIcon boxSize="6" />}
            />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton mt="25px" mr="21px" />

                    <DrawerBody>
                        <VStack spacing="8" mt="20">
                            <Signup flexDirection="column" align="start" />
                            <Button onClick={onClose}>close</Button>
                        </VStack>
                    </DrawerBody>

                    <DrawerFooter mb="5" flexDirection="column">
                        <Footer />
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </HStack>
    )
}
