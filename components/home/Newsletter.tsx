"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email.trim()) return;

  setLoading(true);

  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setEmail("");
  } catch (error) {
    console.error("Waitlist request error:", error);
    alert("Unable to connect. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <section id="waitlist" className="scroll-mt-28 py-24">
      <div className="relative overflow-hidden rounded-[36px] border border-white/20 bg-white/10 px-6 py-14 text-center shadow-2xl backdrop-blur-xl sm:px-10 md:py-20">
        
        {/* Decorative Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-pink-200 shadow-lg">
            <Mail className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Be First to Discover the Surprise ✨
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-pink-100">
            Join the Mystery Scoop Delight waitlist and be among the first to
            know when our cute surprise boxes officially launch.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-white outline-none placeholder:text-pink-200/70 focus:border-pink-300 focus:ring-4 focus:ring-pink-400/20"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-7 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
          ) : (
            <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-green-300/30 bg-green-400/10 px-6 py-4 text-green-100">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <p className="font-medium">
                You're on the list! We'll let you know when the surprises are ready 🎉
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}