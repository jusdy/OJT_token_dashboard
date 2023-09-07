import { Box, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { useAccount, useChainId } from "wagmi";
import TokenSelect from "./tokenSelect";
import { useEffect, useState } from "react";
import { tokenApi, GETH_Address } from "constant";
import { fetchBalance } from "@wagmi/core";

const Swap = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [tokenList, setTokenList] = useState<object[]>();
  const [inTokenIndex, setInTokenIndex] = useState<number>(0);
  const [outTokenIndex, setOutTokenIndex] = useState<number>(-1);

  useEffect(() => {
    const getTokenData = async () => {
      try {
        const data = await fetch(tokenApi);
        const tokenData = await data.json();
        const resultTokenData = tokenData?.datas.filter(
          (token: any) => token.chainId === chainId
        );

        let tempList = resultTokenData;
        for (const item of tempList) {
          const balance = await fetchBalance({
            address: address as `0x${string}`,
            chainId: chainId,
            token: item?.token?.address,
          });
          item.balance = balance;
        }

        let ETH_Token: any = {
          token: {
            name: "Ether",
            symbol: "ETH",
            address: GETH_Address,
          },
        };

        ETH_Token.tokenImage =
          "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png";

        const GETH_balance = await fetchBalance({
          address: address as `0x${string}`,
          chainId: chainId,
          token: GETH_Address,
        });
        ETH_Token.balance = GETH_balance;

        resultTokenData.unshift(ETH_Token);
        setTokenList(resultTokenData);
      } catch (err) {
        console.log(err);
      }
    };
    getTokenData();
  }, [chainId, address]);
  return (
    <Box
      position={"relative"}
      maxW={400}
      h={420}
      border={"1px"}
      borderColor={"gray.300"}
      rounded={"2xl"}
      mx={4}
      p={4}
    >
      <Stack
        rounded={"2xl"}
        px={6}
        py={3}
        border={"1px"}
        borderColor={"#E2E8F0"}
        bg={"gray.50"}
      >
        <Text color={"gray"}>You Pay</Text>
        <Flex gap={2}>
          <Input
            p={0}
            fontSize={32}
            placeholder="0"
            outline={"none"}
            border={"none"}
            _focusVisible={{
              outline: "none!important",
              border: "none!important",
            }}
          />
          <TokenSelect
            tokenList={tokenList}
            selectedToken={inTokenIndex}
            selectedOtherToken={outTokenIndex}
            setTokenIndex={setInTokenIndex}
            setOtherTokenIndex={setOutTokenIndex}
          />
        </Flex>
      </Stack>

      <Stack
        my={2}
        rounded={"2xl"}
        px={6}
        py={3}
        border={"1px"}
        borderColor={"#E2E8F0"}
        bg={"gray.50"}
      >
        <Text color={"gray"}>You Receive</Text>
        <Flex gap={2}>
          <Input
            p={0}
            fontSize={32}
            placeholder="0"
            outline={"none"}
            border={"none"}
            _focusVisible={{
              outline: "none!important",
              border: "none!important",
            }}
          />
          <TokenSelect
            tokenList={tokenList}
            selectedToken={outTokenIndex}
            selectedOtherToken={inTokenIndex}
            setTokenIndex={setOutTokenIndex}
            setOtherTokenIndex={setInTokenIndex}
          />
        </Flex>
      </Stack>
    </Box>
  );
};

export default Swap;
