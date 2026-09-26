"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="text-6xl">🎉</div>

        <p className="mt-5 text-sm font-medium text-pink-200">
          Mystery Scoop Delight
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Order Placed Successfully!
        </h1>

        <p className="mt-4 text-pink-100">
          Thank you for shopping with us. Your order has been received.
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/10 p-4">
            <p className="text-xs text-pink-200">Order ID</p>

            <p className="mt-1 break-all text-sm font-semibold text-white">
              {orderId}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account/orders"
            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
          <div className="text-center text-white">
            <div className="text-5xl">🎉</div>
            <p className="mt-4 text-lg font-semibold">
              Loading order details...
            </p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}