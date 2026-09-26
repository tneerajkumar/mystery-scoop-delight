"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            status,
            payment_status,
            total_amount,
            created_at
          `
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Payment success order load error:", error);
      } else {
        setOrder(data);
      }

      setLoading(false);
    };

    loadOrder();
  }, [orderId, supabase]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        <p>Confirming your payment...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            We couldn't find this order.
          </p>

          <Link
            href="/account/orders"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            View My Orders
          </Link>
        </div>
      </main>
    );
  }

  const paymentSuccessful =
    order.payment_status === "paid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="w-full max-w-2xl rounded-[36px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        {paymentSuccessful ? (
          <>
            <div className="text-7xl">🎉</div>

            <p className="mt-5 text-sm font-medium text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Payment Successful!
            </h1>

            <p className="mt-3 text-pink-100">
              Thank you! Your order has been confirmed.
            </p>

            <div className="mt-8 rounded-2xl border border-white/15 bg-black/10 p-5 text-left">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-pink-200">
                  Order Number
                </span>

                <span className="break-all text-right text-sm font-semibold text-white">
                  {order.order_number}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-pink-200">
                  Payment
                </span>

                <span className="font-semibold text-green-200">
                  Paid ✓
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-pink-200">
                  Order Status
                </span>

                <span className="font-semibold capitalize text-white">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-pink-200">
                  Total
                </span>

                <span className="text-lg font-bold text-white">
                  ₹{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/account/orders/${order.id}`}
                className="rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
              >
                Track My Order
              </Link>

              <Link
                href="/products"
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl">⏳</div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Payment Pending
            </h1>

            <p className="mt-3 text-pink-100">
              Your payment has not been confirmed yet.
            </p>

            <p className="mt-2 text-sm text-pink-200">
              Order: {order.order_number}
            </p>

            <Link
              href={`/account/orders/${order.id}`}
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
            >
              View Order
            </Link>
          </>
        )}
      </div>
    </main>
  );
}