import { useState, useMemo, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { fetchToken, fetchBalance } from '@wagmi/core';
import { isAddress } from 'viem';
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
  useToast 
} from "@chakra-ui/react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokenList: any;
    setTokenList: (list: any) => void;
}

const AddTokenModal = ({
    isOpen,
    onClose,
    setTokenList,
    tokenList
}: ModalProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenDetail, setTokenDetail] = useState<any>();
  const toast = useToast()

  const isValid = useMemo(() => 
    tokenAddress && tokenDetail
  ,[tokenAddress, tokenDetail])

  const fetchTokenData = async () => {
    if(isAddress(tokenAddress)) {
      const data = await fetchToken({
        address: tokenAddress as `0x${string}`
      })
      setTokenDetail(data);
    }
    else {
      setTokenDetail("");
    }
  }
  useEffect(() => {
    fetchTokenData();
  }
  ,[tokenAddress])

  const onAddressChange = (e: any) => {
    setTokenAddress(e.target.value);
  }

  const onAddToken = async () => {
    for (const item of tokenList) {
      if (item.token.name === tokenDetail?.name) {
        toast({
          title: 'Duplicated',
          description: "Token already has been added.",
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        })
        return;
      }
    }
    let newToken: any = {};
    newToken.token = {};
    newToken.token.name = tokenDetail?.name;
    newToken.token.symbol = tokenDetail?.symbol;
    newToken.token.address = tokenDetail.address;

    const balance = await fetchBalance({
      address: address as `0x${string}`,
      chainId: chainId,
      token: tokenDetail?.address,
    });
    newToken.balance = balance;
    setTokenList((prev: any) => [...prev, newToken]);
    onClose();
    setTokenDetail("");
    setTokenAddress("");
    toast({
      title: 'Token added',
      description: "New token has been added successfully.",
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {onClose(); setTokenDetail(""); setTokenAddress("")}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import Custom Token</ModalHeader>
        <ModalCloseButton />
        <ModalBody color={"black"}>
          <Stack spacing={5}>
            <Box>
              <Text fontSize={'sm'}>Input Token Address</Text>
              <Input size='md' onChange={(e) => onAddressChange(e)}/>
            </Box>
            <Box>
              <Text fontSize={'sm'}>Token Symbol</Text>
              <Input size='md' readOnly value={tokenDetail?.symbol ? tokenDetail?.symbol : ""}/>
            </Box>
            <Box>
              <Text fontSize={'sm'}>Token Decimal</Text>
              <Input size='md' readOnly value={tokenDetail?.decimals}/>
            </Box>
          </Stack>

        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => {onClose(); setTokenDetail(""); setTokenAddress("")}}>
            Close
          </Button>
          <Button isDisabled={!isValid} colorScheme="messenger" onClick={onAddToken}>Add</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTokenModal;
