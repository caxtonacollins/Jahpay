import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cleanExpiredNonces, storeNonce } from '@/lib/auth/nonce-utils';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Generate a new nonce
    const nonce = uuidv4();
    const expiresIn = 5 * 60 * 1000; // 5 minutes
    
    // Store the nonce
    storeNonce(address, nonce, expiresIn);

    // Clean up expired nonces
    cleanExpiredNonces();

    // Create a message to sign
    const message = `Welcome to jahpay!\n\nSign this message to prove you own this wallet.\n\nNonce: ${nonce}`;

    return NextResponse.json({
      nonce,
      message,
      timestamp: Date.now(),
      expires_in: expiresIn,
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
