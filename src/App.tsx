import * as React from "react"
import { WagmiConfig } from "wagmi";
import { wagmiConfig, ethereumClient } from "config/web3Clients";
import AppRoutes from "routes";
import { BrowserRouter } from 'react-router-dom';
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { Web3Modal } from "@web3modal/react";

export const App = () => (
  <>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <AppRoutes/>
        </WagmiConfig>
      </ChakraProvider>
    </BrowserRouter>

    <Web3Modal
        projectId={process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID!}
        ethereumClient={ethereumClient}
      />
  </>
)
