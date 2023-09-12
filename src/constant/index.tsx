export const tokenApi = "https://tonstarterapi.tokamak.network/v1/tokens";
export const coingeckoApi =
  "https://api.coingecko.com/api/v3/simple/token_price/";
export const GETH_Address = "0xdd69db25f6d620a7bad3023c5d32761d353d3de9";

export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000
}

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;