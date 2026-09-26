"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
};

const supabase = createClient();

const scoopStyles = [
  { color: "from-pink-400 to-pink-500", badge: "Starter" },
  { color: "from-rose-400 to-pink-500", badge: "Popular" },
  { color: "from-amber-300 to-yellow-300", badge: "Best Value" },
  { color: "from-yellow-300 to-orange-400", badge: "Trending" },
  { color: "from-fuchsia-400 to-pink-500", badge: "Premium" },
  { color: "from-orange-300 to-yellow-400", badge: "Luxury" },
];

export default function FeaturedBoxes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, price")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
  console.error("Featured products load error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  setProducts([]);
} else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadProducts();
  }, []);

  return (
    <section id="scoops" className="scroll-mt-28 py-24">
      {/* Section Heading */}
      <div className="text-center">
        <span className="rounded-full border border-pink-300/30 bg-pink-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-pink-100">
          Choose Your Scoop
        </span>

        <h2 className="mt-6 text-4xl font-extrabold text-white md:text-5xl">
          Find Your Perfect Surprise
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-pink-100">
          Pick the scoop that matches your budget and let us surprise you with
          adorable accessories you'll love.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-16 rounded-[32px] border border-white/15 bg-white/10 p-12 text-center shadow-lg backdrop-blur-xl">
          <div className="text-5xl">🍨</div>

          <p className="mt-4 text-lg font-semibold text-white">
            Loading our scoops...
          </p>

          <p className="mt-2 text-sm text-pink-100">
            Finding the perfect surprises for you.
          </p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="mt-16 rounded-[32px] border border-white/15 bg-white/10 p-12 text-center shadow-lg backdrop-blur-xl">
          <div className="text-5xl">🍨</div>

          <p className="mt-4 text-lg font-semibold text-white">
            Our scoops are coming soon!
          </p>

          <p className="mt-2 text-sm text-pink-100">
            Check back soon for our latest mystery boxes.
          </p>
        </div>
      ) : (
        <>
          {/* Product Cards */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item, index) => {
              const style = scoopStyles[index % scoopStyles.length];

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/15 hover:shadow-2xl"
                >
                  {/* Top Gradient */}
                  <div
                    className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${style.color}`}
                  />

                  <div className="p-8">
                    {/* Badge */}
                    <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-pink-100">
                      {style.badge}
                    </span>

                    {/* Product Name */}
                    <h3 className="mt-5 text-2xl font-bold text-white">
                      {item.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-8">
                      <span className="text-3xl font-extrabold text-white">
                        ₹{Number(item.price).toFixed(0)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-4 min-h-[72px] text-sm leading-6 text-pink-100">
                      {item.description ||
                        "A wonderful mystery surprise waiting to be discovered."}
                    </p>

                    {/* Choose Scoop */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                    >
                      Choose Scoop
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Scoops */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center rounded-full border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl"
            >
              View All Scoops

              <ArrowRight
                size={18}
                className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}