import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Bitmama Webhook Handler
 * POST /api/webhooks/bitmama
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-bitmama-signature");
    const payload = await req.json();

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = verifyBitmamaSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Log webhook
    console.log("Bitmama webhook received:", {
      event: payload.event,
      transaction_id: payload.transaction_id,
      timestamp: new Date().toISOString(),
    });

    // Process webhook
    switch (payload.event) {
      case "transaction.completed":
        await handleTransactionCompleted(payload, "bitmama");
        break;
      case "transaction.failed":
        await handleTransactionFailed(payload, "bitmama");
        break;
      case "transaction.cancelled":
        await handleTransactionCancelled(payload);
        break;
      default:
        console.warn("Unknown event type:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Bitmama webhook error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

function verifyBitmamaSignature(payload: any, signature: string): boolean {
  const secret = process.env.BITMAMA_WEBHOOK_SECRET || "";
  const message = JSON.stringify(payload);
  const hash = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  return hash === signature;
}

async function handleTransactionCompleted(
  payload: any,
  provider: string
): Promise<void> {
  console.log(`Transaction completed for provider: ${provider}`, {
    tx_id: payload.transaction_id,
    status: payload.status,
  });

  // TODO: Update transaction
  // TODO: Call contract
  // TODO: Notify user
}

async function handleTransactionFailed(
  payload: any,
  provider: string
): Promise<void> {
  console.log(`Transaction failed for provider: ${provider}`, {
    tx_id: payload.transaction_id,
    error: payload.error,
  });

  // TODO: Mark failed
  // TODO: Refund
  // TODO: Notify
}

async function handleTransactionCancelled(payload: any): Promise<void> {
  console.log("Transaction cancelled", {
    tx_id: payload.transaction_id,
  });

  // TODO: Handle cancellation
  // TODO: Refund user
}
