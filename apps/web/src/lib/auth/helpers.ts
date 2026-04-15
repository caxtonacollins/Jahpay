import { v4 as uuidv4 } from "uuid";

/**
 * Get or create authentication nonce
 */
export async function getNonce(walletAddress: string): Promise<{
  nonce: string;
  message: string;
  timestamp: number;
  expires_in: number;
}> {
  const response = await fetch("/api/auth/nonce", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: walletAddress }),
  });

  if (!response.ok) {
    throw new Error("Failed to get nonce");
  }

  return response.json();
}

/**
 * Verify wallet signature
 */
export async function verifySignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ token: string; user: any }> {
  const response = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address: walletAddress,
      signature,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Signature verification failed");
  }

  return response.json();
}

/**
 * Get authentication headers
 */
export function getAuthHeaders(walletAddress: string): Record<string, string> {
  return {
    "X-Wallet-Address": walletAddress,
    "Content-Type": "application/json",
  };
}

/**
 * Format signing message
 */
export function formatSigningMessage(nonce: string, timestamp: number): string {
  return `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
}

/**
 * Generate a local nonce for offline use
 */
export function generateLocalNonce(): { nonce: string; timestamp: number } {
  return {
    nonce: uuidv4(),
    timestamp: Date.now(),
  };
}
