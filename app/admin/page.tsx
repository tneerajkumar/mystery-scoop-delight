"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      // Check logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Check user's role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Admin check error:", error);
        router.replace("/account");
        return;
      }

      // Block non-admin users
      if (profile.role !== "admin") {
        router.replace("/account");
        return;
      }

      // Admin access granted
      setName(profile.full_name || user.email || "Admin");
      setLoading(false);
    };

    checkAdmin();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Checking admin access...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Admin Dashboard 👑
            </h1>

            <p className="mt-1 text-sm text-pink-100">
              Welcome, {name}
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Back to Store */}
            <Link
              href="/"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20"
            >
              ← Back to Store
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20"
            >
              Logout
            </button>

          </div>
        </div>

        {/* Dashboard cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">

          {/* Products */}
          <Link
            href="/admin/products"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              Products 📦
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              Add and manage mystery boxes and products.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              Manage Products →
            </p>
          </Link>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              Orders 🛍️
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              View customer orders and update order status.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              Manage Orders →
            </p>
          </Link>

          {/* Customers */}
          <Link
            href="/admin/customers"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              Customers 👥
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              View registered customers and their activity.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              View Customers →
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}