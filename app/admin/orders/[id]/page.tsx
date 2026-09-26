"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ShippingAddress = {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
};

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string;
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const supabase = createClient();

  const orderId = params.id as string;

  useEffect(() => {
  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();


    if (profileError || profile?.role !== "admin") {
      window.location.href = "/account";
      return;
    }

    setCheckingAdmin(false);
  };

  checkAdmin();
}, [supabase]);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
const [paymentStatus, setPaymentStatus] = useState("");

const [courierName, setCourierName] = useState("");
const [trackingNumber, setTrackingNumber] = useState("");
const [trackingUrl, setTrackingUrl] = useState("");

  const loadOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    setError("");

  const { data: orderData, error: orderError } = await supabase
  .from("orders")
  .select(
    `
      id,
      order_number,
      user_id,
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
      created_at,
      updated_at
    `
  )
  .eq("id", orderId)
  .single();

    if (orderError || !orderData) {
      console.error("Admin order load error:", orderError);
      setError("Order could not be found.");
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
          quantity,
          created_at
        `
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemError) {
      console.error("Admin order items load error:", itemError);
    }

    setOrder(orderData);
    setItems(itemData || []);
    setStatus(orderData.status);
    setPaymentStatus(orderData.payment_status);
    setCourierName(orderData.courier_name || "");
setTrackingNumber(orderData.tracking_number || "");
setTrackingUrl(orderData.tracking_url || "");
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("orders")
      .update({
  status,
  payment_status: paymentStatus,
  courier_name: courierName.trim() || null,
  tracking_number: trackingNumber.trim() || null,
  tracking_url: trackingUrl.trim() || null,
  updated_at: new Date().toISOString(),
})
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Order updated successfully.");
    setSaving(false);

    await loadOrder();
  };

  if (checkingAdmin || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading order...
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            {error}
          </p>

          <Link
            href="/admin/orders"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) return null;

  const address = order.shipping_address;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/orders"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Orders
        </Link>

        {/* Header */}
        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs text-pink-200">
                Order Number
              </p>

              <h1 className="mt-1 break-all text-2xl font-bold text-white sm:text-3xl">
                {order.order_number}
              </h1>

              <p className="mt-2 text-sm text-pink-200">
                {new Date(order.created_at).toLocaleString("en-IN")}
              </p>

              <p className="mt-2 break-all text-xs text-pink-200">
                Customer ID: {order.user_id}
              </p>
            </div>

            {/* Status Controls */}
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/10 p-5">
              <h2 className="font-semibold text-white">
                Update Order
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-pink-200">
                    Order Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {orderStatuses.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-purple-900 text-white"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-pink-200">
                    Payment Status
                  </label>

                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {paymentStatuses.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-purple-900 text-white"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
  <h3 className="font-semibold text-white">
    Shipping & Tracking
  </h3>

  <div className="mt-4 space-y-3">
    <input
      type="text"
      value={courierName}
      onChange={(e) => setCourierName(e.target.value)}
      placeholder="Courier name (e.g. Delhivery)"
      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-pink-100/60"
    />

    <input
      type="text"
      value={trackingNumber}
      onChange={(e) => setTrackingNumber(e.target.value)}
      placeholder="Tracking number"
      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-pink-100/60"
    />

    <input
      type="url"
      value={trackingUrl}
      onChange={(e) => setTrackingUrl(e.target.value)}
      placeholder="Tracking URL"
      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-pink-100/60"
    />
  </div>
</div>

              {message && (
                <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-sm text-green-100">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-purple-700 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
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