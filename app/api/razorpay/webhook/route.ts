import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // IMPORTANT:
    // Razorpay signature verification must use the RAW request body.
    const rawBody = await request.text();

    const signature = request.headers.get(
      "x-razorpay-signature"
    );

    const eventId = request.headers.get(
      "x-razorpay-event-id"
    );

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature." },
        { status: 400 }
      );
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is missing."
      );

      return NextResponse.json(
        { error: "Webhook configuration is missing." },
        { status: 500 }
      );
    }

    // Verify Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const receivedBuffer = Buffer.from(
      signature,
      "utf8"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const signatureValid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );

    if (!signatureValid) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // Parse only AFTER signature verification
    const payload = JSON.parse(rawBody);

    const event = payload.event;

    console.log(
      "Razorpay webhook received:",
      event,
      eventId
    );

    const supabase = createAdminClient();

    // --------------------------------------------------
    // Successful payment
    // --------------------------------------------------

    if (
      event === "payment.captured" ||
      event === "order.paid"
    ) {
      const payment =
        payload?.payload?.payment?.entity;

      const razorpayPaymentId =
        payment?.id;

      const razorpayOrderId =
        payment?.order_id;

      if (
        !razorpayPaymentId ||
        !razorpayOrderId
      ) {
        return NextResponse.json(
          { error: "Invalid payment payload." },
          { status: 400 }
        );
      }

      const { data: order, error: orderError } =
        await supabase
          .from("orders")
          .select(
            `
              id,
              payment_status,
              razorpay_order_id
            `
          )
          .eq(
            "razorpay_order_id",
            razorpayOrderId
          )
          .single();

      if (orderError || !order) {
        console.error(
          "Webhook order not found:",
          orderError
        );

        // Return 200 so Razorpay doesn't endlessly retry
        // an event for an unknown order.
        return NextResponse.json({
          success: true,
          ignored: true,
        });
      }

      // Already processed
      if (order.payment_status === "paid") {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
        });
      }

      const { error: updateError } =
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            stock_reserved: false,
            razorpay_payment_id:
              razorpayPaymentId,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", order.id);

      if (updateError) {
        console.error(
          "Webhook order update error:",
          updateError
        );

        return NextResponse.json(
          { error: "Unable to update order." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
      });
    }

    // --------------------------------------------------
    // Failed payment
    // --------------------------------------------------

    if (event === "payment.failed") {
      const payment =
        payload?.payload?.payment?.entity;

      const razorpayOrderId =
        payment?.order_id;

      if (!razorpayOrderId) {
        return NextResponse.json({
          success: true,
          ignored: true,
        });
      }

      const { data: order, error: orderError } =
        await supabase
          .from("orders")
          .select(
            `
              id,
              payment_status,
              stock_reserved,
              razorpay_order_id
            `
          )
          .eq(
            "razorpay_order_id",
            razorpayOrderId
          )
          .single();

      if (orderError || !order) {
        return NextResponse.json({
          success: true,
          ignored: true,
        });
      }

      // Never release stock from a paid order
      if (order.payment_status === "paid") {
        return NextResponse.json({
          success: true,
          ignored: true,
        });
      }

      // Release only if still reserved
      if (order.stock_reserved === true) {
        const { error: releaseError } =
          await supabase.rpc(
            "release_order_stock",
            {
              p_order_id: order.id,
            }
          );

        if (releaseError) {
          console.error(
            "Webhook stock release error:",
            releaseError
          );

          return NextResponse.json(
            {
              error:
                "Unable to release reserved stock.",
            },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        stockReleased: true,
      });
    }

    // --------------------------------------------------
    // Other events
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      ignored: true,
      event,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error
    );

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}