"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    subtotal,
    totalItems,
  } = useCart();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/products"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Continue Shopping
        </Link>

        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-pink-200">
                Mystery Scoop Delight
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Your Cart 🛒
              </h1>

              <p className="mt-2 text-sm text-pink-100">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your
                cart
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 py-10 text-center">
              <div className="text-6xl">🛒</div>

              <h2 className="mt-5 text-2xl font-semibold text-white">
                Your cart is empty
              </h2>

              <p className="mt-2 text-pink-100">
                Discover something beautiful for yourself. ✨
              </p>

              <Link
                href="/products"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-black/10 p-4 sm:flex-row sm:items-center"
                  >
                    {/* Product Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-white transition hover:text-pink-200"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-sm text-pink-100">
                        ₹{Number(item.price).toFixed(2)} each
                      </p>

                      <p className="mt-1 text-xs text-pink-200">
                        {item.stock} available
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg text-white transition hover:bg-white/10"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>

                      <span className="min-w-6 text-center font-semibold text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.quantity >= item.stock}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="min-w-24 text-right">
                      <p className="font-bold text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-xs text-pink-200 transition hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-8 rounded-3xl border border-white/15 bg-black/10 p-6">
                <div className="flex items-center justify-between text-white">
                  <span className="text-lg">Subtotal</span>

                  <span className="text-2xl font-bold">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-pink-200">
                  Shipping and taxes will be calculated during checkout.
                </p>

                <Link
  href="/checkout"
  className="mt-6 block w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 text-center font-semibold text-white transition hover:scale-[1.01]"
>
  Proceed to Checkout →
</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}