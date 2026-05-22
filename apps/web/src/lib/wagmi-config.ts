import { celo, celoAlfajores } from "wagmi/chains";
import { defineChain } from "viem";
import { http, cookieStorage, createStorage, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

const celoSepolia = defineChain({
    id: 11142220,
    name: "Celo Sepolia",
    nativeCurrency: { decimals: 18, name: "CELO", symbol: "CELO" },
    rpcUrls: {
        default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    },
    blockExplorers: {
        default: {
            name: "Celo Sepolia Blockscout",
            url: "https://celo-sepolia.blockscout.com",
        },
    },
    testnet: true,
});

export const chains = [celo, celoAlfajores, celoSepolia] as const;

export function getConfig() {
    return createConfig({
        chains,
        connectors: [
            injected(),
            walletConnect({
                projectId:
                    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
                    "5e89c4eefe79b7c5cfd8c43f6826e9da",
            }),
        ],
        transports: {
            [celo.id]: http(),
            [celoAlfajores.id]: http(),
            [celoSepolia.id]: http(),
        },
        ssr: true,
        storage: createStorage({
            storage: cookieStorage,
        }),
    });
}

export const rainbowkitConfig = {
    initialChain: celo,
    showRecentlyUsed: true,
};
