"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function FloatingCart() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Open cart${totalItems > 0 ? ` with ${totalItems} items` : ""}`}
      className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-2xl text-white shadow-[0_10px_35px_rgba(236,72,153,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_15px_45px_rgba(236,72,153,0.6)] sm:bottom-8 sm:right-8"
    >
      🛒

      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-white px-1.5 text-xs font-extrabold text-pink-500 shadow-lg">
          {totalItems}
        </span>
      )}
    </Link>
  );
}