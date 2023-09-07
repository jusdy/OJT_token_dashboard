import { Box, Flex } from "@chakra-ui/react";
import { Web3Button } from "@web3modal/react";

const Header = () => {
    return (
        <Flex height={16} alignItems={'center'} px={20} bg={'#B2F5EA'}>
            <Box ml={'auto'}>
                <Web3Button/>
            </Box>
        </Flex>
    )
}

export default Header;