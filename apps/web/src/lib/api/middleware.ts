import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to authenticate requests using wallet address header
 */
export function withAuthMiddleware(
  handler: (req: NextRequest, walletAddress: string) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const walletAddress = req.headers.get("X-Wallet-Address");

      if (!walletAddress) {
        return NextResponse.json(
          { error: "Missing wallet address header" },
          { status: 401 }
        );
      }

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return NextResponse.json(
          { error: "Invalid wallet address format" },
          { status: 400 }
        );
      }

      // Call the handler with the wallet address
      return await handler(req, walletAddress);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to enforce POST only
 */
export function enforcePostOnly(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest) => {
    if (req.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }
    return handler(req);
  };
}

/**
 * Middleware to enforce GET only
 */
export function enforceGetOnly(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest) => {
    if (req.method !== "GET") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }
    return handler(req);
  };
}

/**
 * Validate JSON request body
 */
export async function validateJsonBody(req: NextRequest): Promise<any> {
  try {
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid content type");
    }

    return await req.json();
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}

/**
 * Rate limit helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  window: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.reset) {
    requestCounts.set(key, { count: 1, reset: now + window });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Get rate limit remaining
 */
export function getRateLimitRemaining(key: string, limit: number = 10): number {
  const record = requestCounts.get(key);
  if (!record) {
    return limit;
  }
  return Math.max(0, limit - record.count);
}
