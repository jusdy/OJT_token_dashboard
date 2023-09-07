import {
  AbsoluteCenter,
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

interface TokenSelectProps {
  tokenList: any;
  selectedToken: number;
  selectedOtherToken: number;
  setTokenIndex: (ind: number) => void;
  setOtherTokenIndex: (ind: number) => void;
}

const TokenSelect = ({
  tokenList,
  selectedToken,
  selectedOtherToken,
  setTokenIndex,
  setOtherTokenIndex,
}: TokenSelectProps) => {
  const [selectToken, setSelectToken] = useState<boolean>(false);

  return (
    <>
      <HStack
        rounded={"2xl"}
        minW={"130px"}
        bg={selectedToken >= 0 ? "gray.100" : "purple.400"}
        px={2}
        color={"black"}
        alignItems={"center"}
        gap={1}
        cursor={"pointer"}
        _hover={{
          backgroundColor: selectedToken >= 0 ? "gray.200" : "purple.200",
        }}
        onClick={() => setSelectToken(true)}
      >
        {selectedToken >= 0 ? (
          <>
            {tokenList?.[selectedToken]?.tokenImage ? (
              <Image
                boxSize={"28px"}
                rounded={100}
                src={tokenList?.[selectedToken]?.tokenImage}
              />
            ) : (
              <Box boxSize={"28px"} />
            )}
            <Text fontSize={20} as={"b"}>
              {tokenList?.[selectedToken]?.token?.symbol}
            </Text>
            <Image boxSize={3} src="/svg/down-arrow.svg" />
          </>
        ) : (
          <Flex alignItems={"center"} gap={2}>
            <Text as={"b"} color={"white"}>
              Select Token
            </Text>
            <Image boxSize={3} src="/svg/down-arrow-white.svg" />
          </Flex>
        )}
      </HStack>
      {selectToken && (
        <AbsoluteCenter
          w={"100%"}
          h={"100%"}
          left={"50%"}
          top={"50%"}
          bg={"white"}
          rounded={"2xl"}
          borderColor={"gray.300"}
          p={4}
          cursor={"default"}
          overflow={"auto"}
        >
          <Image
            ml={"auto"}
            boxSize={"20px"}
            src="/svg/close.svg"
            cursor={"pointer"}
            rounded={100}
            onClick={() => {
              setSelectToken(false);
            }}
          />

          {tokenList?.map((item: any, key: number) => (
            <HStack
              key={key}
              py={2}
              px={5}
              alignItems={"center"}
              _hover={{ backgroundColor: "gray.300" }}
              cursor={"pointer"}
              onClick={() => {
                if (key === selectedOtherToken) {
                  setOtherTokenIndex(selectedToken);
                }
                setTokenIndex(key);
                setSelectToken(false);
              }}
            >
              <Box>
                {item?.tokenImage ? (
                  <Image
                    boxSize={"40px"}
                    src={item?.tokenImage}
                    rounded={100}
                  />
                ) : (
                  <Box boxSize={"40px"} />
                )}
              </Box>
              <VStack
                justifyItems={"center"}
                alignItems={"start"}
                justifyContent={"space-around"}
                gap={0}
              >
                <Text>{item.token.symbol}</Text>
                <Text fontSize={14} color={"gray"}>
                  {item.token.name}
                </Text>
              </VStack>
            </HStack>
          ))}
        </AbsoluteCenter>
      )}
    </>
  );
};

export default TokenSelect;
