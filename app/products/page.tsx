"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string | null;
};

export default function ProductsPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, compare_at_price, stock, image_url"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Products load error:", error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading products...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Shop Our Collection ✨
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-pink-100">
            Discover cute surprises and beautiful products selected especially
            for you.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-[32px] border border-white/15 bg-white/10 p-10 text-center shadow-xl backdrop-blur-xl">
            <div className="text-5xl">🛍️</div>

            <h2 className="mt-4 text-xl font-semibold text-white">
              Products Coming Soon!
            </h2>

            <p className="mt-2 text-sm text-pink-100">
              We're preparing something special for you. ✨
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-white/10">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-white">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-pink-100">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      ₹{Number(product.price).toFixed(2)}
                    </span>

                    {product.compare_at_price &&
                      Number(product.compare_at_price) >
                        Number(product.price) && (
                        <span className="text-sm text-pink-200/70 line-through">
                          ₹{Number(product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        product.stock > 0
                          ? "text-green-200"
                          : "text-red-200"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>

                    <Link
                      href={`/products/${product.slug}`}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        product.stock > 0
                          ? "bg-white text-purple-700 hover:scale-105"
                          : "pointer-events-none bg-white/20 text-pink-100"
                      }`}
                    >
                      View Product
                    </Link>
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