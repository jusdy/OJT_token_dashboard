import { useEffect, useState } from "react";
import { useChainId, useAccount } from "wagmi";
import { fetchBalance } from "@wagmi/core";
import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Text,
  Flex,
  Button,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { tokenApi } from "constant";
import AddTokenModal from "components/addTokenModal";
import TransferModal from "components/transferModal";
import TransactionHistory from "components/transactionHistory";
import Swap from "./swap";

const Dashboard = () => {
  const [tokenList, setTokenList] = useState<object[]>();
  const chainId = useChainId();
  const { address } = useAccount();
  const [isModal, setModal] = useState<boolean>(false);
  const [isTransferModal, setTransferModal] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedDecimals, setSelectedDecimals] = useState<number>(0);
  
  useEffect(() => {
    const getTokenData = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    getTokenData();
  }, [chainId, address]);

  console.log(tokenList);

  return (
    <Box mx={[4, 8, 20, 20]} mt={20}>
      <Tabs>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Tx History</Tab>
          <Tab>Swap Page</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {address && (
              <>
                <AddTokenModal
                  isOpen={isModal}
                  onClose={() => setModal(false)}
                  setTokenList={setTokenList}
                  tokenList={tokenList}
                />
                <TransferModal
                  isOpen={isTransferModal}
                  onClose={() => setTransferModal(false)}
                  tokenAddress={selectedAddress}
                  decimals={selectedDecimals}
                />
                {isLoading && (
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
                {!isLoading && (
                  <>
                    <Button
                      colorScheme="blue"
                      onClick={() => setModal((prev) => !prev)}
                    >
                      Add Custom Token
                    </Button>

                    <TableContainer mt={5}>
                      <Table variant="striped">
                        <Thead>
                          <Tr bg={"#2775ff"}>
                            <Th color={"white"}>Name</Th>
                            <Th color={"white"}>Address</Th>
                            <Th color={"white"}>Balance</Th>
                            <Th color={"white"}>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tokenList?.map((item: any, key: number) => (
                            <Tr key={key}>
                              <Td>
                                <Flex alignItems="center" gap={2}>
                                  {item.tokenImage ? (
                                    <Image
                                      src={item.tokenImage}
                                      alt="Token Image"
                                      boxSize={"30px"}
                                    />
                                  ) : (
                                    <Box w={"30px"} />
                                  )}

                                  <Text fontSize="md" color={"black"} as="b">
                                    {item?.token?.name}
                                  </Text>
                                  <Text fontSize="md" color={"gray"} as="b">
                                    {item?.token?.symbol}
                                  </Text>
                                </Flex>
                              </Td>
                              <Td>{item?.token?.address}</Td>
                              <Td>
                                {parseFloat(item?.balance?.formatted).toFixed(
                                  2
                                )}
                              </Td>
                              <Td>
                                <Button
                                  colorScheme="purple"
                                  onClick={() => {
                                    setTransferModal((prev) => !prev);
                                    setSelectedAddress(item?.token?.address);
                                    setSelectedDecimals(item?.token?.decimals);
                                  }}
                                >
                                  Transfer
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel>
            <TransactionHistory />
          </TabPanel>
          <TabPanel>
            <Swap tokenList={tokenList} loading={isLoading}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Dashboard;
