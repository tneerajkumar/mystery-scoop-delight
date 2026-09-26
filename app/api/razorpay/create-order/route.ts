import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Make sure the customer is logged in
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

    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    // Load the customer's order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          user_id,
          total_amount,
          payment_status
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

    // Don't create another Razorpay order for an already-paid order
    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay environment variables are missing.");

      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Razorpay expects INR amount in paise
    const amount = Math.round(Number(order.total_amount) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount." },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: order.order_number,
      notes: {
        internal_order_id: order.id,
        user_id: user.id,
      },
    });

    const { error: razorpayOrderUpdateError } = await supabase
  .from("orders")
  .update({
    razorpay_order_id: razorpayOrder.id,
    updated_at: new Date().toISOString(),
  })
  .eq("id", order.id)
  .eq("user_id", user.id);

if (razorpayOrderUpdateError) {
  console.error(
    "Failed to save Razorpay order ID:",
    razorpayOrderUpdateError
  );

  return NextResponse.json(
    { error: "Unable to save payment information." },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order." },
      { status: 500 }
    );
  }
}