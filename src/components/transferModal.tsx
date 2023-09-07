import { useState, useMemo } from "react";
import { erc20ABI } from "@wagmi/core";
import { useContractWrite } from "wagmi";
import { isAddress, parseUnits } from "viem";
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
  Input,
  Box,
  Text,
  useToast,
  Spinner
} from "@chakra-ui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  decimals: number;
}

const TransferModal = ({
  isOpen,
  onClose,
  tokenAddress,
  decimals,
}: ModalProps) => {
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<any>("0");
  const toast = useToast();

  const {isLoading, write } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "transfer",
    args: [
      recipientAddress as `0x${string}`,
      parseUnits(transferAmount, decimals),
    ],
    onError(err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      })
    }
  });

  const isValid = useMemo(
    () => isAddress(recipientAddress) && transferAmount,
    [recipientAddress, transferAmount]
  );

  const onAddressChange = (e: any) => {
    setRecipientAddress(e.target.value);
  };

  const handleTransfer = async () => {
    write?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setTransferAmount("");
        setRecipientAddress("");
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transfer token</ModalHeader>
        <ModalCloseButton />
        <ModalBody color={"black"}>
          <Stack spacing={5}>
            <Box>
              <Text fontSize={"sm"}>Recipient Address</Text>
              <Input size="md" onChange={(e) => onAddressChange(e)} />
            </Box>
            <Box>
              <Text fontSize={"sm"}>Amount to Transfer</Text>
              <Input size="md" onChange={(e: any) => setTransferAmount(e.target.value)}/>
            </Box>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              onClose();
              setTransferAmount("");
              setRecipientAddress("");
            }}
          >
            Close
          </Button>
          <Button
            isDisabled={!isValid || isLoading}
            colorScheme="messenger"
            onClick={handleTransfer}
            minW={'90px'}
          >
            {isLoading ?
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="sm"
              /> :
              "Transfer"
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferModal;
