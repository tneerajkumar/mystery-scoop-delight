"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function AdminCustomersPage() {
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    setLoading(true);

    const { data, error } = await supabase
  .from("profiles")
  .select(`
    id,
    full_name,
    phone,
    role,
    created_at
  `)
  .eq("role", "customer")
  .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin customers load error:", error);
      setCustomers([]);
    } else {
      setCustomers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.full_name?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.id.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
              Customers 👥
            </h1>

            <p className="mt-2 text-sm text-pink-100">
              View and manage registered customers.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ← Admin Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or customer ID..."
            className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-pink-100/60"
          />
        </div>

        {/* Customer Count */}
        <div className="mt-6 rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
          <p className="text-sm text-pink-200">
            Total Customers
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {customers.length}
          </p>
        </div>

        {/* Customers */}
        {loading ? (
          <div className="mt-6 rounded-[28px] border border-white/20 bg-white/10 p-10 text-center text-white shadow-xl backdrop-blur-xl">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-white/20 bg-white/10 p-10 text-center shadow-xl backdrop-blur-xl">
            <div className="text-5xl">👥</div>

            <h2 className="mt-4 text-xl font-bold text-white">
              No customers found
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-[28px] border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px_140px] lg:items-center">
                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="text-xs text-pink-200">
                      Customer
                    </p>

                    <Link
  href={`/admin/customers/${customer.id}`}
  className="mt-1 block truncate text-lg font-bold text-white transition hover:text-pink-200"
>
  {customer.full_name || "Unnamed Customer"}
</Link>

                    <p className="mt-2 text-sm text-pink-100">
                      {customer.phone || "No phone number"}
                    </p>

                    <p className="mt-1 truncate text-xs text-pink-200">
                      ID: {customer.id}
                    </p>
                  </div>

                  {/* Role */}
                  <div className="lg:border-l lg:border-white/10 lg:pl-5">
                    <p className="text-xs text-pink-200">
                      Role
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize text-white">
                      {customer.role}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="lg:border-l lg:border-white/10 lg:pl-5">
                    <p className="text-xs text-pink-200">
                      Joined
                    </p>

                    <p className="mt-2 text-sm font-medium text-white">
                      {new Date(
                        customer.created_at
                      ).toLocaleDateString("en-IN")}
                    </p>
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