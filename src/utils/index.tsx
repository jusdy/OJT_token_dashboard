export const shortenAddress = (address: `0x${string}` | string) => {
    return address ? address?.slice(0, 8) + '...' + address?.slice(-5) : '_';
};

export const shortenHash = (address: string) => {
    return address ? address?.slice(0, 20) + '...' : '_';
};