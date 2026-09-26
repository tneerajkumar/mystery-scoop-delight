"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to create your account.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage(
        "Account created successfully! Please check your email to verify your account."
      );
      setMessageType("success");

      setFullName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (error) {
      console.error("Signup request failed:", error);

      setMessage(
        "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

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
            Create your account ✨
          </h1>

          <p className="mt-3 text-sm leading-6 text-pink-100">
            Sign up to save your details, manage your orders and discover
            delightful surprises.
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          {/* Full Name */}
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            autoComplete="name"
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
          />

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            autoComplete="email"
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (minimum 6 characters)"
            minLength={6}
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
          />

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className="mt-5 text-center">
            <p
              className={`text-sm ${
                messageType === "success"
                  ? "text-green-200"
                  : "text-pink-100"
              }`}
            >
              {message}
            </p>

            {messageType === "error" &&
              message.toLowerCase().includes("already registered") && (
                <Link
                  href="/login"
                  className="mt-2 inline-block font-semibold text-white underline decoration-pink-300 underline-offset-4 transition hover:text-pink-200"
                >
                  Go to Login →
                </Link>
              )}
          </div>
        )}

        {/* Login */}
        <p className="mt-6 text-center text-sm text-pink-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-white underline decoration-pink-300 underline-offset-4 transition hover:text-pink-200"
          >
            Login
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