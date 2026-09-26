"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


type Profile = {
  full_name: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile load error:", error.message);
      } else if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
  console.error("Profile update error:", error);

  setMessage(`Unable to save: ${error.message}`);
  return;
}

    setMessage("Profile updated successfully! ✨");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <Link
          href="/account"
          className="inline-block text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to My Account
        </Link>

        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            My Profile ✨
          </h1>

          <p className="mt-3 text-sm leading-6 text-pink-100">
            Keep your account details up to date.
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-center text-sm text-pink-100">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}