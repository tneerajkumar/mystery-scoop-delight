"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  created_at: string;
};

export default function OrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoggedIn(false);
        setOrders([]);
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
      subtotal,
      shipping_amount,
      discount_amount,
      total_amount,
      created_at
    `
  )
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders load error:", error);
        setOrders([]);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    };

    loadOrders();
  }, [supabase]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/20 text-green-100";

      case "cancelled":
        return "bg-red-500/20 text-red-100";

      case "shipped":
        return "bg-blue-500/20 text-blue-100";

      case "processing":
        return "bg-yellow-500/20 text-yellow-100";

      default:
        return "bg-pink-500/20 text-pink-100";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading your orders...
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Login Required
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            Please log in to view your orders.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            My Orders 📦
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            View your previous and current orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-[32px] border border-white/20 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="text-6xl">📦</div>

            <h2 className="mt-4 text-2xl font-bold text-white">
              No Orders Yet
            </h2>

            <p className="mt-2 text-pink-100">
              Your orders will appear here after you make a purchase.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-pink-200">
                      Order Number
                    </p>

                    <h2 className="mt-1 font-bold text-white">
                      {order.order_number}
                    </h2>

                    <p className="mt-2 text-xs text-pink-200">
                      {new Date(order.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white">
                      Payment: {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-pink-200">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:scale-105"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}