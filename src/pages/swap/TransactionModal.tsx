import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Stack,
  Box,
  Text,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { erc20ABI, useContractWrite, useSendTransaction, useAccount, useWaitForTransaction, usePrepareContractWrite, useChainId } from "wagmi";
import { SWAP_ROUTER_ADDRESS } from "constant/address";
import { parseUnits } from "viem";
import { SwapOptions, SwapRouter, Trade } from "@uniswap/v3-sdk";
import { fromReadableAmount } from "utils";
import JSBI from "jsbi";
import { ethers } from "ethers";
import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, tokenApi } from "constant";
import { fetchBalance } from "@wagmi/core";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  inToken: Token;
  outToken: Token;
  inAmount: string;
  outAmount: string;
  currentRoute: any;
  setTokenList: (list: any) => void;
  setInTokenBalance: (balance: string) => void;
  setOutTokenBalance: (balance: string) => void;
}

const TransactionModal = ({
  isOpen,
  onClose,
  inToken,
  outToken,
  inAmount,
  outAmount,
  currentRoute,
  setTokenList,
  setInTokenBalance,
  setOutTokenBalance
}: ModalProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isConfirm, setConfirm] = useState<boolean>(false);
  const [confirmStatus, setConfirmStatus] = useState<number>(0);
  const [swapTx, setSwapTx] = useState<any>();

  const swapTransaction = useSendTransaction({
    ...swapTx,
    onError(err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setConfirm(false);
    }
  });

  const toast = useToast();

  const { config } = usePrepareContractWrite({
    address: inToken?.address as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [SWAP_ROUTER_ADDRESS, parseUnits(inAmount, inToken?.decimals)],
  })
  const swapTokenApprove = useContractWrite({
    address: inToken?.address as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [SWAP_ROUTER_ADDRESS, parseUnits(inAmount, inToken?.decimals)],
    onError(err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setConfirm(false);
    },
    onSuccess() {
      const uncheckedTrade = Trade.createUncheckedTrade({
        route: currentRoute,
        inputAmount: CurrencyAmount.fromRawAmount(
          inToken!,
          fromReadableAmount(inAmount, inToken?.decimals).toString()
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
          outToken!,
          JSBI.toNumber(
            JSBI.BigInt(ethers.utils.parseUnits(outAmount, outToken?.decimals))
          )
        ),
        tradeType: TradeType.EXACT_INPUT,
      });

      const options: SwapOptions = {
        slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
        recipient: address as string,
      };

      const methodParameters = SwapRouter.swapCallParameters(
        [uncheckedTrade],
        options
      );

      const tx = {
        data: methodParameters.calldata,
        to: SWAP_ROUTER_ADDRESS,
        value: methodParameters.value,
        from: address,
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      };
      setSwapTx(tx);
    },
  });

  const onHandleConfirm = () => {
    setConfirm(true);
    swapTokenApprove?.write();
  };


  useWaitForTransaction({hash: swapTokenApprove?.data?.hash,
    onSuccess() {
      setConfirmStatus(1);
      swapTransaction.sendTransaction(swapTx);
    },
  });

  useWaitForTransaction({hash: swapTransaction?.data?.hash,
    onSuccess() {
      toast({
        title: 'Swap Info',
        description: `You've converted ${inAmount} ${inToken.symbol} to ${Number(outAmount).toFixed(3)} ${outToken.symbol}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      })
      onClose();
      setConfirmStatus(0);
      setConfirm(false);
      getTokenData();
    },
  });

  const getTokenData = async () => {
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
    setTokenList(resultTokenData);

    const inBalance = await fetchBalance({
      address: address as `0x${string}`,
      chainId: chainId,
      token: inToken?.address as `0x${string}`,
    });
    setInTokenBalance(parseFloat(inBalance?.formatted).toFixed(3));

    const outBalance = await fetchBalance({
      address: address as `0x${string}`,
      chainId: chainId,
      token: outToken?.address as `0x${string}`,
    });
    setOutTokenBalance(parseFloat(outBalance?.formatted).toFixed(3));
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setConfirmStatus(0);
        setConfirm(false);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={"center"} fontSize={16}>
          {isConfirm ? "" : "Reviewing Swap"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody color={"black"}>
          {isConfirm ? (
            <Box>
              <Stack>
                <Text fontSize={18} as={"b"} textAlign={"center"}>
                  {confirmStatus === 0 ? `Enable spending ${inToken.symbol}...` : `Confirm Swap`}
                </Text>
                <Spinner
                  mx={"auto"}
                  thickness="4px"
                  speed={confirmStatus === 0 ? "0.65s" : "3s"}
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text textAlign={"center"} color={"gray"} mt={8} fontSize={16}>
                  Proceed in your wallet
                </Text>
                <Flex justifyContent={"center"} gap={4}>
                  <Box w={3} h={3} rounded={100} bg={"pink.600"} />
                  <Box
                    w={3}
                    h={3}
                    rounded={100}
                    bg={confirmStatus === 1 ? "pink.600" : "gray.300"}
                  />
                </Flex>
              </Stack>
            </Box>
          ) : (
            <Box>
              <Stack>
                <Text color={"gray"}>You pay</Text>
                <Text as={"b"} fontSize={28}>
                  {inAmount} {inToken?.symbol}
                </Text>
              </Stack>

              <Stack mt={8}>
                <Text color={"gray"}>You receive</Text>
                <Text as={"b"} fontSize={28}>
                  {Number(outAmount).toFixed(3)} {outToken?.symbol}
                </Text>
              </Stack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          {!isConfirm && (
            <Button
              w={"full"}
              h={14}
              fontSize={20}
              rounded={"2xl"}
              colorScheme="messenger"
              onClick={onHandleConfirm}
            >
              Confirm Swap
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
