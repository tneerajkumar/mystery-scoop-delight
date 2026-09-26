"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(
          "This password reset link is invalid or has expired. Please request a new one."
        );
        setMessageType("error");
      }

      setCheckingSession(false);
    };

    checkSession();
  }, [supabase]);

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setMessage(
      "Password updated successfully! Redirecting you to Login..."
    );
    setMessageType("success");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  if (checkingSession) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="relative w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Checking reset link...
          </h1>

          <p className="mt-3 text-sm text-pink-100">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="text-center">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Reset Password 🔐
          </h1>

          <p className="mt-3 text-sm leading-6 text-pink-100">
            Create a new password for your account.
          </p>
        </div>

        {!message.includes("invalid or has expired") && (
          <form
            onSubmit={handleResetPassword}
            className="mt-8 space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (minimum 6 characters)"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {message && (
          <p
            className={`mt-5 text-center text-sm ${
              messageType === "success"
                ? "text-green-200"
                : "text-pink-100"
            }`}
          >
            {message}
          </p>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Login
        </Link>
      </div>
    </main>
  );
}