import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Cashramp Webhook Handler
 * POST /api/webhooks/cashramp
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-cashramp-signature");
    const payload = await req.json();

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = verifyCashrampSignature(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Log webhook
    console.log("Cashramp webhook received:", {
      event: payload.event,
      order_id: payload.order_id,
      timestamp: new Date().toISOString(),
    });

    // Process webhook
    switch (payload.event) {
      case "order.completed":
        await handleOrderCompleted(payload, "cashramp");
        break;
      case "order.failed":
        await handleOrderFailed(payload, "cashramp");
        break;
      case "order.cancelled":
        await handleOrderCancelled(payload);
        break;
      default:
        console.warn("Unknown event type:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cashramp webhook error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

function verifyCashrampSignature(payload: any, signature: string): boolean {
  const secret = process.env.CASHRAMP_WEBHOOK_SECRET || "";
  const message = JSON.stringify(payload);
  const hash = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  return hash === signature;
}

async function handleOrderCompleted(
  payload: any,
  provider: string
): Promise<void> {
  console.log(`Order completed for provider: ${provider}`, {
    order_id: payload.order_id,
    status: payload.status,
  });

  // TODO: Update transaction status
  // TODO: Call contract function
  // TODO: Notify user
}

async function handleOrderFailed(
  payload: any,
  provider: string
): Promise<void> {
  console.log(`Order failed for provider: ${provider}`, {
    order_id: payload.order_id,
    error: payload.error,
  });

  // TODO: Mark as failed
  // TODO: Refund if necessary
  // TODO: Notify user
}

async function handleOrderCancelled(payload: any): Promise<void> {
  console.log("Order cancelled", {
    order_id: payload.order_id,
  });

  // TODO: Handle cancellation
  // TODO: Refund user
}
