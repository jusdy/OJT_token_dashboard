import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  useAccount,
  useChainId,
  useContractReads,
  useContractWrite,
  usePublicClient,
  useSendTransaction
} from "wagmi";
import TokenSelect from "./tokenSelect";
import { useEffect, useMemo, useState } from "react";
// import { tokenApi, GETH_Address } from "constant";
import { fetchBalance, erc20ABI } from "@wagmi/core";
import {
  Pool,
  Route,
  SwapQuoter,
  Trade,
  computePoolAddress,
  SwapOptions,
  SwapRouter,
} from "@uniswap/v3-sdk";
import { FeeAmount, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from "constant";
import {
  FACTORY_CONTRACT,
  QuoterV2_ADDRESS,
  SWAP_ROUTER_ADDRESS,
} from "constant/address";
import {
  Currency,
  CurrencyAmount,
  Token,
  TradeType,
  Percent,
} from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import QuoterABI from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { parseUnits } from "viem";
import { ethers } from "ethers";
import { fromReadableAmount } from "utils";
import JSBI from "jsbi";
import TransactionModal from "./TransactionModal";

interface PropsType {
  tokenList: any;
  loading: boolean;
}

const Swap = ({ tokenList, loading }: PropsType) => {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const chainId = useChainId();

  const [inTokenIndex, setInTokenIndex] = useState<number>(0);
  const [outTokenIndex, setOutTokenIndex] = useState<number>(-1);
  const [inAmount, setInAmount] = useState<string>("");
  const [outAmount, setOutAmount] = useState<string>("");
  const [inTokenBalance, setInTokenBalance] = useState<string>("");
  const [outTokenBalance, setOutTokenBalance] = useState<string>("");
  const [currentRoute, setCurrentRoute] = useState<any>();
  const [swapTx, setSwapTx] = useState<any>();
  const [isModal, setModal] = useState<boolean>(false);

  const swapTransaction = useSendTransaction(swapTx);

  const tokenA = useMemo(
    () =>
      tokenList &&
      inTokenIndex >= 0 &&
      outTokenIndex >= 0 &&
      new Token(
        tokenList?.[inTokenIndex].chainId,
        tokenList?.[inTokenIndex].token.address,
        tokenList?.[inTokenIndex].token.decimals,
        tokenList?.[inTokenIndex].token.symbol,
        tokenList?.[inTokenIndex].token.name
      ),
    [inTokenIndex, outTokenIndex, tokenList]
  );

  const tokenB = useMemo(
    () =>
      tokenList &&
      inTokenIndex >= 0 &&
      outTokenIndex >= 0 &&
      new Token(
        tokenList?.[outTokenIndex]?.chainId,
        tokenList?.[outTokenIndex]?.token?.address,
        tokenList?.[outTokenIndex]?.token?.decimals,
        tokenList?.[outTokenIndex]?.token?.symbol,
        tokenList?.[outTokenIndex]?.token?.name
      ),
    [inTokenIndex, outTokenIndex, tokenList]
  );

  const currentPoolAddress = useMemo(
    () =>
      tokenA && tokenB
        ? computePoolAddress({
            factoryAddress: FACTORY_CONTRACT,
            tokenA: tokenA,
            tokenB: tokenB,
            fee: FeeAmount.MEDIUM,
          })
        : "",
    [tokenA, tokenB]
  );

  const poolContract = {
    address: currentPoolAddress as `0x${string}`,
    abi: IUniswapV3PoolABI.abi as any,
  };

  const approvalContract = {
    address: tokenA?.address,
    abi: erc20ABI,
  };

  const swapTokenApprove = useContractWrite({
    address: tokenA?.address as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [SWAP_ROUTER_ADDRESS, parseUnits(inAmount, tokenA?.decimals)],
    onError(err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    onSuccess() {
      onSwap();
    },
  });

  const onSwap = () => {
    const uncheckedTrade = Trade.createUncheckedTrade({
      route: currentRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        tokenA!,
        fromReadableAmount(inAmount, tokenA?.decimals).toString()
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        tokenB!,
        JSBI.toNumber(JSBI.BigInt(ethers.utils.parseUnits(outAmount, tokenB?.decimals))),
      ),
      tradeType: TradeType.EXACT_INPUT,
    });

    const options: SwapOptions = {
      slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: address as string,
    }
    
    const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options)

    const tx = {
      data: methodParameters.calldata,
      to: SWAP_ROUTER_ADDRESS,
      value: methodParameters.value,
      from: address,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    }
    setSwapTx(tx);
    swapTransaction.sendTransaction();
  }

  const { data } = useContractReads({
    contracts: [
      {
        ...poolContract,
        functionName: "token0",
      },
      {
        ...poolContract,
        functionName: "token1",
      },
      {
        ...poolContract,
        functionName: "fee",
      },
      {
        ...poolContract,
        functionName: "tickSpacing",
      },
      {
        ...poolContract,
        functionName: "liquidity",
      },
      {
        ...poolContract,
        functionName: "slot0",
      },
      {
        ...approvalContract,
        functionName: "approve",
      },
    ],
  });

  const getOutputQuote = async (route: Route<Currency, Currency>) => {
    const { calldata } = await SwapQuoter.quoteCallParameters(
      route,
      CurrencyAmount.fromRawAmount(
        tokenA,
        fromReadableAmount(
          Number(inAmount).toString(),
          tokenA?.decimals
        ).toString()
      ),
      TradeType.EXACT_INPUT,
      {
        useQuoterV2: true,
      }
    );

    const quoteCallReturnData: any = await publicClient.call({
      to: QuoterV2_ADDRESS,
      data: calldata as `0x${string}`,
    });
    console.log(quoteCallReturnData);

    return ethers.utils.defaultAbiCoder.decode(
      ["uint256"],
      quoteCallReturnData.data
    );
  };

  useEffect(() => {
    if (inAmount === "") setOutAmount("");
    if (tokenA && Number(inAmount) > 0 && data?.[0].result) {
      const getOutputAmount = async () => {
        const sqrtPriceX96 = data?.[5].result?.[0];
        const liquidity: any = data?.[4].result;
        const tick = data?.[5].result?.[1];

        const pool = new Pool(
          tokenA!,
          tokenB!,
          FeeAmount.MEDIUM,
          sqrtPriceX96.toString()!,
          liquidity.toString()!,
          tick!
        );

        const swapRoute = new Route([pool], tokenA, tokenB);
        setCurrentRoute(swapRoute);
        const amountOut = await getOutputQuote(swapRoute);
        setOutAmount(ethers.utils.formatEther(amountOut[0]));
      };
      getOutputAmount();
    }
  }, [inAmount]);

  const onApprove = async () => {
    swapTokenApprove.write?.();
  };

  useEffect(() => {
    const setBalance = async () => {
      if (inTokenIndex >= 0) {
        const inBalance = await fetchBalance({
          address: address as `0x${string}`,
          chainId: chainId,
          token: tokenList?.[inTokenIndex]?.token?.address,
        });
        setInTokenBalance(parseFloat(inBalance?.formatted).toFixed(3));
      }

      if (outTokenIndex >= 0) {
        const outBalance = await fetchBalance({
          address: address as `0x${string}`,
          chainId: chainId,
          token: tokenList?.[outTokenIndex]?.token?.address,
        });
        console.log(outBalance);
        setOutTokenBalance(parseFloat(outBalance?.formatted).toFixed(3));
      }
    };
    setBalance();
  }, [inTokenIndex, outTokenIndex]);

  const isSwap: boolean = useMemo(
    () =>
      inAmount &&
      outAmount &&
      inTokenIndex &&
      outTokenIndex &&
      !swapTokenApprove.isLoading &&
      !swapTransaction.isLoading &&
      data?.[0].result
        ? true
        : false,
    [
      inTokenIndex,
      outTokenIndex,
      inAmount,
      outAmount,
      swapTokenApprove.isLoading,
      swapTransaction.isLoading,
      data
    ]
  );

  return (
    <>
      <TransactionModal
        isOpen={isModal}
        onClose={() => setModal(false)}
        inToken={tokenA}
        outToken={tokenB}
        inAmount={inAmount}
        outAmount={outAmount}
        swapTokenApprove={swapTokenApprove}
      />
      {!loading ? (
        <Box
          position={"relative"}
          maxW={400}
          h={420}
          border={"1px"}
          borderColor={"gray.300"}
          rounded={"2xl"}
          p={2}
        >
          <Stack
            rounded={"2xl"}
            px={4}
            py={3}
            border={"1px"}
            borderColor={"#E2E8F0"}
            bg={"gray.50"}
            _hover={{ borderColor: "gray.400" }}
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
                onChange={(e) => {
                  const reg = /^\d*\.?\d*$/;
                  if (reg.test(e.target.value) === true)
                    setInAmount(e.target.value);
                  else return;
                }}
                value={inAmount}
              />
              <TokenSelect
                tokenList={tokenList}
                selectedToken={inTokenIndex}
                selectedOtherToken={outTokenIndex}
                setTokenIndex={setInTokenIndex}
                setOtherTokenIndex={setOutTokenIndex}
              />
            </Flex>
            {inTokenIndex >= 0 && (
              <Flex alignItems={"center"} minW={6}>
                <Text ml={"auto"} color={"gray"}>
                  Balance: {inTokenBalance}
                </Text>
                <Button
                  bg={"E2E8F0"}
                  ml={2}
                  p={0}
                  fontSize={14}
                  height={"fit-content"}
                  color={"purple"}
                  onClick={() => setInAmount(inTokenBalance)}
                >
                  MAX
                </Button>
              </Flex>
            )}
          </Stack>

          <Stack
            my={2}
            rounded={"2xl"}
            px={4}
            py={3}
            border={"1px"}
            borderColor={"#E2E8F0"}
            bg={"gray.50"}
            _hover={{ borderColor: "gray.400" }}
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
                onChange={(e) => setOutAmount(e.target.value)}
                value={outAmount}
              />
              <TokenSelect
                tokenList={tokenList}
                selectedToken={outTokenIndex}
                selectedOtherToken={inTokenIndex}
                setTokenIndex={setOutTokenIndex}
                setOtherTokenIndex={setInTokenIndex}
              />
            </Flex>
            <Flex minH={6}>
              {outTokenIndex >= 0 && (
                <Text ml={"auto"} color={"gray"}>
                  Balance: {outTokenBalance}
                </Text>
              )}
            </Flex>
          </Stack>

          <Button
            colorScheme="green"
            isDisabled={!isSwap}
            w={"100%"}
            h={14}
            rounded={"2xl"}
            onClick={() => setModal(true)}
          >
            {!swapTokenApprove.isLoading && !swapTransaction.isLoading ? (
              "Review Swap"
            ) : (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="sm" 
              />
            )}
          </Button>
        </Box>
      ) : (
        <Flex justifyContent={"center"} alignItems={"center"} gap={4}>
          <Text as={"b"} fontSize={20}>
            Loading Data...
          </Text>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      )}
    </>
  );
};

export default Swap;
function toast(arg0: {
  title: string;
  description: string;
  status: string;
  duration: number;
  isClosable: boolean;
  position: string;
}) {
  throw new Error("Function not implemented.");
}
