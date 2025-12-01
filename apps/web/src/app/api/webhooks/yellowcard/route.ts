import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Yellow Card Webhook Handler
 * POST /api/ramp/webhooks/yellowcard
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-yellowcard-signature");
    const payload = await req.json();

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = verifyYellowCardSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Log webhook for debugging
    console.log("Yellow Card webhook received:", {
      event: payload.event,
      transaction_id: payload.transaction_id,
      timestamp: new Date().toISOString(),
    });

    // Process webhook based on event type
    switch (payload.event) {
      case "transaction.completed":
        await handleTransactionCompleted(payload, "yellowcard");
        break;
      case "transaction.failed":
        await handleTransactionFailed(payload, "yellowcard");
        break;
      case "kyc.verified":
        await handleKYCVerified(payload);
        break;
      case "kyc.rejected":
        await handleKYCRejected(payload);
        break;
      default:
        console.warn("Unknown event type:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Yellow Card webhook error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

function verifyYellowCardSignature(payload: any, signature: string): boolean {
  const secret = process.env.YELLOWCARD_WEBHOOK_SECRET || "";
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

  // TODO: Update transaction in database
  // TODO: Trigger contract function to complete off-ramp if applicable
  // TODO: Notify user via email/SMS
}

async function handleTransactionFailed(
  payload: any,
  provider: string
): Promise<void> {
  console.log(`Transaction failed for provider: ${provider}`, {
    tx_id: payload.transaction_id,
    error: payload.error,
  });

  // TODO: Mark transaction as failed
  // TODO: Refund user if necessary
  // TODO: Notify user
}

async function handleKYCVerified(payload: any): Promise<void> {
  console.log("KYC verification completed", {
    user_id: payload.user_id,
  });

  // TODO: Update user KYC status in database
  // TODO: Notify user of successful verification
}

async function handleKYCRejected(payload: any): Promise<void> {
  console.log("KYC verification rejected", {
    user_id: payload.user_id,
    reason: payload.reason,
  });

  // TODO: Update user KYC status
  // TODO: Notify user
}
