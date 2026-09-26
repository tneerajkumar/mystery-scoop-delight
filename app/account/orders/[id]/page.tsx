"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  shipping_address: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  courier_name: string | null;
tracking_number: string | null;
tracking_url: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const supabase = createClient();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      setLoading(true);

      const { data: orderData, error: orderError } = await supabase
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
            shipping_address,
courier_name,
tracking_number,
tracking_url,
created_at
          `
        )
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        console.error("Order load error:", orderError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select(
          `
            id,
            product_id,
            product_name,
            product_price,
            quantity
          `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (itemError) {
        console.error("Order items load error:", itemError);
      }

      setOrder(orderData);
      setItems(itemData || []);
      setLoading(false);
    };

    loadOrder();
  }, [orderId, supabase]);

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
        Loading order...
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            This order doesn't exist or you don't have access to it.
          </p>

          <Link
            href="/account/orders"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const address = order.shipping_address;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account/orders"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to My Orders
        </Link>

        {/* Order Header */}
        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-pink-200">
                Order Number
              </p>

              <h1 className="mt-1 break-all text-2xl font-bold text-white sm:text-3xl">
                {order.order_number}
              </h1>

              <p className="mt-2 text-sm text-pink-200">
                {new Date(order.created_at).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${getStatusClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold capitalize text-white">
                Payment: {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
<div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
  <h2 className="text-xl font-bold text-white">
    Track Your Order 🚚
  </h2>

  {order.status === "cancelled" ? (
    <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-5">
      <p className="font-semibold text-red-100">
        ❌ Order Cancelled
      </p>

      <p className="mt-1 text-sm text-red-100/80">
        This order has been cancelled.
      </p>
    </div>
  ) : (
    <>
      <div className="mt-6 space-y-6">
        {[
          {
            status: "pending",
            label: "Order Placed",
            icon: "🛒",
          },
          {
            status: "confirmed",
            label: "Order Confirmed",
            icon: "✅",
          },
          {
            status: "processing",
            label: "Preparing Your Order",
            icon: "📦",
          },
          {
            status: "shipped",
            label: "Shipping Started",
            icon: "🚚",
          },
          {
            status: "delivered",
            label: "Delivered",
            icon: "🏠",
          },
        ].map((step, index, steps) => {
          const statusOrder = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
          ];

          const currentIndex = statusOrder.indexOf(order.status);
          const stepIndex = statusOrder.indexOf(step.status);

          const completed = stepIndex <= currentIndex;

          return (
            <div
              key={step.status}
              className="relative flex gap-4"
            >
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-5 top-10 h-8 w-0.5 ${
                    completed && stepIndex < currentIndex
                      ? "bg-pink-400"
                      : "bg-white/15"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  completed
                    ? "bg-pink-500"
                    : "bg-white/10"
                }`}
              >
                <span className="text-lg">
                  {step.icon}
                </span>
              </div>

              <div className="pt-1">
                <p
                  className={`font-semibold ${
                    completed
                      ? "text-white"
                      : "text-white/40"
                  }`}
                >
                  {step.label}
                </p>

                {step.status === order.status && (
                  <p className="mt-1 text-xs text-pink-200">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipping Details */}
      {order.status === "shipped" ||
      order.status === "delivered" ? (
        order.courier_name ||
        order.tracking_number ||
        order.tracking_url ? (
          <div className="mt-8 rounded-2xl border border-white/15 bg-black/10 p-5">
            <h3 className="font-semibold text-white">
              Shipping Details
            </h3>

            {order.courier_name && (
              <p className="mt-3 text-sm text-pink-100">
                Courier:{" "}
                <span className="font-medium text-white">
                  {order.courier_name}
                </span>
              </p>
            )}

            {order.tracking_number && (
              <p className="mt-2 text-sm text-pink-100">
                Tracking ID:{" "}
                <span className="font-medium text-white">
                  {order.tracking_number}
                </span>
              </p>
            )}

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:scale-105"
              >
                Track Order →
              </a>
            )}
          </div>
        ) : null
      ) : null}
    </>
  )}
</div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <h2 className="text-xl font-bold text-white">
              Order Items
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-pink-100">
                      ₹{Number(item.product_price).toFixed(2)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-bold text-white">
                    ₹
                    {(
                      Number(item.product_price) * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-pink-100">
                <span>Subtotal</span>
                <span>
                  ₹{Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-pink-100">
                <span>Shipping</span>
                <span>
                  ₹{Number(order.shipping_amount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-pink-100">
                <span>Discount</span>
                <span>
                  -₹{Number(order.discount_amount).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-white/15 pt-4">
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-bold text-white">
            Delivery Address
          </h2>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">
            <p className="font-semibold text-white">
              {address.recipient_name}
            </p>

            <p className="mt-2 text-sm text-pink-100">
              {address.address_line1}
              {address.address_line2
                ? `, ${address.address_line2}`
                : ""}
            </p>

            {address.landmark && (
              <p className="text-sm text-pink-100">
                Landmark: {address.landmark}
              </p>
            )}

            <p className="text-sm text-pink-100">
              {address.city}, {address.state} - {address.pincode}
            </p>

            <p className="mt-2 text-sm text-pink-200">
              Phone: {address.phone}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}