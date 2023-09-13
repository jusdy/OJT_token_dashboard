import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { shortenAddress, shortenHash } from "utils";

const TransactionHistory = () => {
  const { address, isConnected } = useAccount();
  const txQuery = gql`
    query GetTransactions {
        transfers(where:{from: "${address}"}) {
            transactionHash
            value
            from
            to
            blockTimestamp
        }
        }
    `;
  const { data } = useQuery(txQuery);

  return (
    <TableContainer>
      {isConnected && 
      <Table variant="striped">
        <TableCaption placement="top" fontSize={24} mb={6}>
          Transaction History
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Transaction Hash</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.transfers?.map((item: any, key: number) => (
            <Tr key={key}>
              <Td color={"Highlight"}>
                <Link
                  href={`https://goerli.etherscan.io/tx/${item.transactionHash}`}
                  isExternal
                >
                  <Tooltip hasArrow label={item.transactionHash} aria-label="A tooltip">
                    {shortenHash(item.transactionHash)}
                  </Tooltip>
                </Link>
              </Td>
              <Td>
                <Tooltip hasArrow label={item.from} aria-label="A tooltip">
                  {shortenAddress(item.from)}
                </Tooltip>
              </Td>
              <Td color={"Highlight"}>
                <Tooltip
                  hasArrow
                  w={"fit-content"}
                  label={item.to}
                  aria-label="A tooltip"
                >
                  <Link
                    href={`https://goerli.etherscan.io/address/${item.to}`}
                    isExternal
                  >
                    {shortenAddress(item.to)}
                  </Link>
                </Tooltip>
              </Td>
              <Td>{formatEther(item.value)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      }
    </TableContainer>
  );
};
export default TransactionHistory;
