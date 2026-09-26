"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

type CustomerOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

type CustomerAddress = {
  id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export default function AdminCustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;

      setLoading(true);
      setError("");

      // Check logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Check admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        router.replace("/account");
        return;
      }

      // Load customer
      const { data: customerData, error: customerError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          role,
          created_at
        `)
        .eq("id", customerId)
        .eq("role", "customer")
        .single();

      if (customerError || !customerData) {
        console.error(
          "Customer load error:",
          customerError
        );

        setError("Customer could not be found.");
        setLoading(false);
        return;
      }

      // Load customer's orders
      const { data: orderData, error: orderError } = await supabase
  .from("orders")
  .select(`
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    created_at
  `)
  .eq("user_id", customerId)
  .order("created_at", {
    ascending: false,
  });

if (orderError) {
  console.error(
    "Customer orders load error:",
    orderError
  );
}

// Load customer's saved addresses
const { data: addressData, error: addressError } = await supabase
  .from("addresses")
  .select(`
    id,
    recipient_name,
    phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    is_default
  `)
  .eq("user_id", customerId)
  .order("is_default", {
    ascending: false,
  });

if (addressError) {
  console.error(
    "Customer addresses load error:",
    addressError
  );
}

setCustomer(customerData);
setOrders(orderData || []);
setAddresses(addressData || []);
setLoading(false);
  };

    loadCustomer();
  }, [customerId, router, supabase]);

  const totalSpent = orders
    .filter((order) => order.payment_status === "paid")
    .reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );

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

      case "confirmed":
        return "bg-purple-500/20 text-purple-100";

      default:
        return "bg-pink-500/20 text-pink-100";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 text-white">
        <div className="rounded-[28px] border border-white/20 bg-white/10 px-8 py-6 shadow-xl backdrop-blur-xl">
          Loading customer...
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-5xl">👤</div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Customer Not Found
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            {error || "This customer does not exist."}
          </p>

          <Link
            href="/admin/customers"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            ← Back to Customers
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          href="/admin/customers"
          className="text-sm font-medium text-pink-200 transition hover:text-white"
        >
          ← Back to Customers
        </Link>

        {/* Header */}
        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-pink-200">
                Customer Profile
              </p>

              <h1 className="mt-1 break-words text-3xl font-bold text-white sm:text-4xl">
                {customer.full_name || "Unnamed Customer"}
              </h1>

              <p className="mt-3 break-all text-sm text-pink-100">
                Customer ID: {customer.id}
              </p>
            </div>

            <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold capitalize text-white">
              {customer.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-pink-200">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {orders.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-pink-200">
              Total Spent
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              ₹{totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-sm text-pink-200">
              Joined
            </p>

            <p className="mt-2 text-lg font-bold text-white">
              {new Date(
                customer.created_at
              ).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-bold text-white">
            Customer Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <p className="text-xs text-pink-200">
                Full Name
              </p>

              <p className="mt-2 font-semibold text-white">
                {customer.full_name || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <p className="text-xs text-pink-200">
                Phone
              </p>

              <p className="mt-2 font-semibold text-white">
                {customer.phone || "Not provided"}
              </p>
            </div>
          </div>
        </div>

                {/* Saved Addresses */}
        <div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Saved Addresses
              </h2>

              <p className="mt-1 text-sm text-pink-100">
                Delivery addresses saved by this customer.
              </p>
            </div>

            <p className="text-sm font-semibold text-pink-200">
              {addresses.length}{" "}
              {addresses.length === 1 ? "Address" : "Addresses"}
            </p>
          </div>

          {addresses.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-8 text-center">
              <div className="text-4xl">📍</div>

              <p className="mt-3 font-semibold text-white">
                No saved addresses
              </p>

              <p className="mt-1 text-sm text-pink-100">
                This customer has not saved any delivery address.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="relative rounded-2xl border border-white/10 bg-black/10 p-5"
                >
                  {address.is_default && (
                    <span className="absolute right-4 top-4 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-100">
                      ★ Default
                    </span>
                  )}

                  <p className="pr-24 font-semibold text-white">
                    {address.recipient_name}
                  </p>

                  <p className="mt-2 text-sm text-pink-100">
                    {address.address_line1}
                    {address.address_line2
                      ? `, ${address.address_line2}`
                      : ""}
                  </p>

                  {address.landmark && (
                    <p className="mt-1 text-sm text-pink-100">
                      Landmark: {address.landmark}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-pink-100">
                    {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>

                  <p className="mt-3 text-sm text-pink-200">
                    📞 {address.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Order History */}
        <div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Order History
              </h2>

              <p className="mt-1 text-sm text-pink-100">
                Orders placed by this customer.
              </p>
            </div>

            <p className="text-sm font-semibold text-pink-200">
              {orders.length}{" "}
              {orders.length === 1 ? "Order" : "Orders"}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-8 text-center">
              <div className="text-4xl">📦</div>

              <p className="mt-3 font-semibold text-white">
                No orders yet
              </p>

              <p className="mt-1 text-sm text-pink-100">
                This customer has not placed any orders.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px_150px_130px] lg:items-center">
                    {/* Order */}
                    <div className="min-w-0">
                      <p className="text-xs text-pink-200">
                        Order Number
                      </p>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mt-1 block truncate text-base font-bold text-white hover:text-pink-200"
                      >
                        {order.order_number}
                      </Link>

                      <p className="mt-2 text-xs text-pink-200">
                        {new Date(
                          order.created_at
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-pink-200">
                        Status
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-xs text-pink-200">
                        Payment
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize text-white">
                        {order.payment_status}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="lg:text-right">
                      <p className="text-xs text-pink-200">
                        Total
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        ₹
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}