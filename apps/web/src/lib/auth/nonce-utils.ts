// In-memory store for nonces (in production, use Redis or database)
const nonceStore = new Map<string, { nonce: string; expires: number }>();

export function cleanExpiredNonces() {
  const now = Date.now();
  for (const [address, { expires }] of nonceStore.entries()) {
    if (expires < now) {
      nonceStore.delete(address);
    }
  }
}

export function verifyNonce(address: string, nonce: string): boolean {
  const stored = nonceStore.get(address);
  if (!stored || stored.nonce !== nonce) {
    return false;
  }
  nonceStore.delete(address); // Remove used nonce
  return true;
}

export function storeNonce(address: string, nonce: string, expiresIn: number) {
  const expires = Date.now() + expiresIn;
  nonceStore.set(address, { nonce, expires });
  return { nonce, expires };
}
