import { BigNumber, ethers} from "ethers";

export const shortenAddress = (address: `0x${string}` | string) => {
  return address ? address?.slice(0, 7) + "..." + address?.slice(-5) : "_";
};

export const shortenHash = (address: string) => {
  return address ? address?.slice(0, 20) + "..." : "_";
};

export function fromReadableAmount(
  amount: string,
  decimals: number
): BigNumber {
  return ethers.utils.parseUnits(amount, decimals)
}

export enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}