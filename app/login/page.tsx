"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    clearMessage();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    clearMessage();
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setGoogleLoading(false);
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleForgotPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    clearMessage();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setResetLoading(false);

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }

    setMessage(
      "Password reset link has been sent to your email. Please check your inbox."
    );
    setMessageType("success");
  };

  const switchToForgotPassword = () => {
    setIsForgotPassword(true);
    setPassword("");
    clearMessage();
  };

  const switchToLogin = () => {
    setIsForgotPassword(false);
    setPassword("");
    clearMessage();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            {isForgotPassword
              ? "Forgot Password 🔑"
              : "Welcome back ✨"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-pink-100">
            {isForgotPassword
              ? "Enter your email address and we'll send you a password reset link."
              : "Login to manage your account and view your orders."}
          </p>
        </div>

        {/* Login */}
        {!isForgotPassword && (
          <>
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
              />

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
                />

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={switchToForgotPassword}
                    className="text-sm font-semibold text-pink-100 underline decoration-pink-300 underline-offset-4 transition hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-xs font-medium text-pink-100/70">
                OR
              </span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white px-6 py-4 font-semibold text-gray-800 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {googleLoading ? (
                "Connecting to Google..."
              ) : (
                <>
                  <span className="text-lg font-bold">G</span>
                  Continue with Google
                </>
              )}
            </button>
          </>
        )}

        {/* Forgot Password */}
        {isForgotPassword && (
          <form
            onSubmit={handleForgotPassword}
            className="mt-8 space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              autoFocus
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
            />

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resetLoading
                ? "Sending Reset Link..."
                : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={switchToLogin}
              className="w-full text-center text-sm font-semibold text-pink-100 transition hover:text-white"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* Message */}
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

        {/* Create Account */}
        <p className="mt-6 text-center text-sm text-pink-100">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-white underline decoration-pink-300 underline-offset-4 transition hover:text-pink-200"
          >
            Create Account
          </Link>
        </p>

        {/* Back Home */}
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}