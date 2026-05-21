import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from apps/web/.env
dotenv.config({ path: path.join(__dirname, '../apps/web/.env') });

// ERC-8004 Identity Registry ABI
const IDENTITY_REGISTRY_ABI = parseAbi([
    'function register(string memory uri) public returns (uint256)',
    'function getAgent(uint256 agentId) public view returns (address owner, string memory uri, uint256 createdAt)',
]);

async function deployAgent() {
    let privateKey = process.env.AGENT_DEPLOYER_PRIVATE_KEY as `0x${string}`;
    const identityRegistry = process.env.NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY as `0x${string}`;
    const agentURI = 'https://jahpay.vercel.app/api/agent/manifest';

    if (!privateKey) {
        console.error('❌ Error: AGENT_DEPLOYER_PRIVATE_KEY not found in environment variables');
        process.exit(1);
    }

    if (!identityRegistry) {
        console.error('❌ Error: NEXT_PUBLIC_ERC8004_IDENTITY_REGISTRY not found in environment variables');
        process.exit(1);
    }

    // Ensure private key is properly formatted (0x + 64 hex chars)
    if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}` as `0x${string}`;
    }
    if (privateKey.length !== 66) {
        console.error(`❌ Error: Private key must be 66 characters (0x + 64 hex chars), got ${privateKey.length}`);
        process.exit(1);
    }

    console.log('Starting ERC-8004 Agent Registration...');
    console.log(`Agent URI: ${agentURI}`);
    console.log(`Identity Registry: ${identityRegistry}`);
    console.log(`Deployer Address: ${privateKey.slice(0, 6)}...${privateKey.slice(-4)}`);
    console.log('');

    try {
        const publicClient = createPublicClient({
            chain: celo,
            transport: http(),
        });

        const account = privateKeyToAccount(privateKey);
        const walletClient = createWalletClient({
            chain: celo,
            transport: http(),
            account,
        });

        console.log('Registering agent on-chain...');

        // Register agent
        const hash = await walletClient.writeContract({
            address: identityRegistry,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'register',
            args: [agentURI],
        });

        console.log(`Transaction submitted: ${hash}`);
        console.log('Waiting for confirmation...');

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            console.log('Agent registered successfully!');
            console.log(`Transaction Hash: ${receipt.transactionHash}`);
            console.log(`Block Number: ${receipt.blockNumber}`);
            console.log('');
            console.log('Update your .env with:');
            console.log(`NEXT_PUBLIC_AGENT_ID=<tokenId from transaction logs>`);

            const agentDetails = await publicClient.readContract({
                address: identityRegistry,
                abi: IDENTITY_REGISTRY_ABI,
                functionName: 'getAgent',
                args: [BigInt(9105)], // agent ID
            });

            console.log('Agent Owner:', agentDetails[0]);
            console.log('Agent URI:', agentDetails[1]);
            console.log('Created At:', agentDetails[2]);

        } else {
            console.error('❌ Registration failed: Transaction reverted');
            process.exit(1);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Registration error:', message);
        process.exit(1);
    }
}

deployAgent();
