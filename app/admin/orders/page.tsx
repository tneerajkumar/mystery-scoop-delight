"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
  created_at: string;
};

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

const orderStatuses = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "all",
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function AdminOrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});

  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      setCheckingAdmin(true);
      setError("");

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

      await loadOrders();
    };

    const loadOrders = async () => {
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
            created_at
          `
        )
        .order("created_at", { ascending: false });

      if (orderError) {
        console.error("Admin orders load error:", orderError);
        setError(orderError.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      const loadedOrders = orderData || [];

      setOrders(loadedOrders);

      const userIds = [
        ...new Set(loadedOrders.map((order) => order.user_id)),
      ];

      if (userIds.length > 0) {
        const { data: customerData, error: customerError } =
          await supabase
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", userIds);

        if (customerError) {
          console.error(
            "Admin customer details load error:",
            customerError
          );
        } else {
          const customerMap: Record<string, Customer> = {};

          (customerData || []).forEach((customer) => {
            customerMap[customer.id] = customer;
          });

          setCustomers(customerMap);
        }
      } else {
        setCustomers({});
      }

      setLoading(false);
    };

    checkAdminAndLoad();
  }, [supabase]);

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = customers[order.user_id];

      const customerName =
        customer?.full_name?.toLowerCase() || "";

      const customerPhone =
        customer?.phone?.toLowerCase() || "";

      const orderNumber =
        order.order_number?.toLowerCase() || "";

      const customerId =
        order.user_id?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        orderNumber.includes(searchText) ||
        customerName.includes(searchText) ||
        customerPhone.includes(searchText) ||
        customerId.includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    customers,
    search,
    statusFilter,
    paymentFilter,
  ]);

const orderStats = useMemo(() => {
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    paid: orders.filter((order) => order.payment_status === "paid").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
  };
}, [orders]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/20 text-green-100 border-green-300/20";

      case "shipped":
        return "bg-blue-500/20 text-blue-100 border-blue-300/20";

      case "processing":
        return "bg-yellow-500/20 text-yellow-100 border-yellow-300/20";

      case "confirmed":
        return "bg-purple-500/20 text-purple-100 border-purple-300/20";

      case "cancelled":
        return "bg-red-500/20 text-red-100 border-red-300/20";

      default:
        return "bg-pink-500/20 text-pink-100 border-pink-300/20";
    }
  };

  const getPaymentClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-100 border-green-300/20";

      case "failed":
        return "bg-red-500/20 text-red-100 border-red-300/20";

      case "refunded":
        return "bg-orange-500/20 text-orange-100 border-orange-300/20";

      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (checkingAdmin || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 text-white">
        <div className="text-center">
          <div className="text-5xl">📦</div>

          <p className="mt-4 text-lg font-semibold">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/admin"
          className="text-sm font-medium text-pink-200 transition hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
              Orders 📦
            </h1>

            <p className="mt-2 text-sm text-pink-100">
              View and manage all customer orders.
            </p>
          </div>

          <button
  type="button"
  onClick={() => {
    setStatusFilter("all");
    setPaymentFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">📦 Total Orders</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.total}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    View all orders →
  </p>
</button>
        </div>

        {/* Order Stats */}
<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
  {/* Total */}
  <button
  type="button"
  onClick={() => {
    setStatusFilter("all");
    setPaymentFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">📦 Total Orders</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.total}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    Show all orders →
  </p>
</button>

  {/* Pending */}
 <button
  type="button"
  onClick={() => {
    setStatusFilter("pending");
    setPaymentFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">⏳ Pending</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.pending}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    View pending orders →
  </p>
</button>

  {/* Paid */}
  <button
  type="button"
  onClick={() => {
    setPaymentFilter("paid");
    setStatusFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">💰 Paid</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.paid}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    View paid orders →
  </p>
</button>

  {/* Shipped */}
  <button
  type="button"
  onClick={() => {
    setStatusFilter("shipped");
    setPaymentFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">🚚 Shipped</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.shipped}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    View shipped orders →
  </p>
</button>

  {/* Delivered */}
  <button
  type="button"
  onClick={() => {
    setStatusFilter("delivered");
    setPaymentFilter("all");
  }}
  className="rounded-[24px] border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
>
  <p className="text-sm text-pink-200">✅ Delivered</p>

  <p className="mt-2 text-3xl font-bold text-white">
    {orderStats.delivered}
  </p>

  <p className="mt-2 text-xs text-pink-100">
    View delivered orders →
  </p>
</button>
</div>

        {/* Filters */}
        <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number, customer name, phone, or ID..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white outline-none placeholder:text-pink-100/70 focus:border-white/40"
            />

            {/* Order Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white outline-none"
            >
              {orderStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-purple-900 text-white"
                >
                  {status === "all"
                    ? "All Order Status"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1)}
                </option>
              ))}
            </select>

            {/* Payment Status */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white outline-none"
            >
              {paymentStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-purple-900 text-white"
                >
                  {status === "all"
                    ? "All Payment Status"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1)}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Result Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-pink-100">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {orders.length}
            </span>{" "}
            orders
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-5 text-sm text-red-100">
            Unable to load orders: {error}
          </div>
        )}

        {/* Empty */}
        {!error && filteredOrders.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-white/20 bg-white/10 p-10 text-center shadow-xl backdrop-blur-xl">
            <div className="text-5xl">📭</div>

            <h2 className="mt-4 text-xl font-bold text-white">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Orders */}
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => {
            const customer = customers[order.user_id];

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 sm:p-6"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px_180px_160px] lg:items-center">

                  {/* Order */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-pink-200">
                      Order Number
                    </p>

                    <h2 className="mt-1 break-all text-lg font-bold text-white">
                      {order.order_number}
                    </h2>

                    <p className="mt-2 text-sm text-pink-100">
                      {formatDate(order.created_at)}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs text-pink-200">
                        Customer
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {customer?.full_name || "Unknown Customer"}
                      </p>

                      {customer?.phone && (
                        <p className="mt-1 text-xs text-pink-100">
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs text-pink-200">
                      Order Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs text-pink-200">
                      Payment
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentClass(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 lg:text-right">
                    <p className="text-xs text-pink-200">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-white">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </p>

                    <p className="mt-2 text-xs text-pink-100">
                      View Details →
                    </p>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}