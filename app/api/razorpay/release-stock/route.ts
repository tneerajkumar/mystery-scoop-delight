import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify the customer is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Read the order ID
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    // 3. Verify the order belongs to this customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          payment_status,
          stock_reserved
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

    // 4. Never release stock from a paid order
    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "Paid orders cannot release stock.",
        },
        { status: 400 }
      );
    }

    // 5. Release the stock through our database function
    const { error: releaseError } = await supabase.rpc(
      "release_order_stock",
      {
        p_order_id: orderId,
      }
    );

    if (releaseError) {
      console.error(
        "Release order stock error:",
        releaseError
      );

      return NextResponse.json(
        { error: "Unable to release reserved stock." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      stockReleased: true,
    });
  } catch (error) {
    console.error(
      "Release stock API error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to release reserved stock." },
      { status: 500 }
    );
  }
}