import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify logged-in customer
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    if (
      !orderId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 }
      );
    }

    // 2. Load OUR order.
    // Never trust the Razorpay order ID supplied by the browser
    // as the source of truth for verification.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          payment_status,
          razorpay_order_id
        `
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // 3. Don't process an already-paid order again
    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: order.id,
      });
    }

    if (
  !order.razorpay_order_id ||
  order.razorpay_order_id !== razorpayOrderId
) {
  return NextResponse.json(
    { error: "Payment does not belong to this order." },
    { status: 400 }
  );
}

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is missing.");

      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    /*
     * Razorpay signature:
     *
     * HMAC-SHA256(
     *   razorpay_order_id + "|" + razorpay_payment_id,
     *   RAZORPAY_KEY_SECRET
     * )
     */
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // 4. Timing-safe signature comparison
    const receivedBuffer = Buffer.from(razorpaySignature, "utf8");
    const generatedBuffer = Buffer.from(generatedSignature, "utf8");

    const signatureValid =
      receivedBuffer.length === generatedBuffer.length &&
      crypto.timingSafeEqual(
        receivedBuffer,
        generatedBuffer
      );

    if (!signatureValid) {
      console.error("Razorpay signature verification failed.");

      return NextResponse.json(
        {
          error: "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // 5. Payment is authentic.
    // Update OUR order.
    const { error: updateError } = await supabase
  .from("orders")
  .update({
    payment_status: "paid",
    status: "confirmed",
    stock_reserved: false,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    updated_at: new Date().toISOString(),
  })
  .eq("id", order.id)
  .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Order payment update error:",
        updateError
      );

      return NextResponse.json(
        { error: "Payment verified but order update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}