"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setName(profile?.full_name || user.email || "Customer");
      setLoading(false);
    };

    loadAccount();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading your account...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Welcome, {name} ✨
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Home */}
            <Link
              href="/"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20"
            >
              ← Home
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

        {/* Account Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">

          {/* Profile */}
          <Link
            href="/account/profile"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              My Profile
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              Manage your account details.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              View & Edit →
            </p>
          </Link>

          {/* Orders */}
          <Link
            href="/account/orders"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              My Orders
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              View your order history and status.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              View Orders →
            </p>
          </Link>

          {/* Addresses */}
          <Link
            href="/account/addresses"
            className="rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              Addresses
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              Manage your delivery addresses.
            </p>

            <p className="mt-4 text-sm font-medium text-pink-200">
              Manage Addresses →
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}