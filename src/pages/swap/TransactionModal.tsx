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
} from "@chakra-ui/react";
import { Token } from "@uniswap/sdk-core";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  inToken: Token;
  outToken: Token;
  inAmount: string;
  outAmount: string;
  swapTokenApprove: any;
}

const TransactionModal = ({
  isOpen,
  onClose,
  inToken,
  outToken,
  inAmount,
  outAmount,
  swapTokenApprove
}: ModalProps) => {
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={'center'} fontSize={16}>Review Swap</ModalHeader>
        <ModalCloseButton />
        <ModalBody color={"black"}>
          <Stack>
            <Text color={'gray'}>You pay</Text>
            <Text as={'b'} fontSize={32}>{inAmount} {inToken?.symbol}</Text>
          </Stack>

          <Stack mt={8}>
            <Text color={'gray'}>You receive</Text>
            <Text as={'b'} fontSize={32}>{Number(outAmount).toFixed(3)} {outToken?.symbol}</Text>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button w={'full'} h={14} fontSize={20} rounded={'2xl'} colorScheme="messenger">Confirm Swap</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
