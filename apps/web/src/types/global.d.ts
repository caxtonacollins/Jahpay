interface EthereumProvider {
  isMiniPay?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface Window {
  ethereum?: EthereumProvider;
}
