import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
  } from "@web3modal/ethereum";
  import { configureChains, createConfig } from "wagmi";
  import { goerli, mainnet } from "wagmi/chains";
  
  const chains = [mainnet, goerli];
  
  const { publicClient, webSocketPublicClient } = configureChains(chains, [
    w3mProvider({ projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID! }),
  ]);
  export const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
      projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID!,
      chains,
    }),
    publicClient,
    webSocketPublicClient,
  });
  
  export const ethereumClient = new EthereumClient(wagmiConfig,  chains);