import { Button, useColorMode, IconButton } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

export default function ColorMode() {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
        <>
            {colorMode === 'light' ? (
                <IconButton
                    aria-label="color-mode"
                    icon={<SunIcon />}
                    onClick={toggleColorMode}
                />
            ) : (
                <IconButton
                    aria-label="color-mode"
                    icon={<MoonIcon />}
                    onClick={toggleColorMode}
                />
            )}
        </>
    )
}
