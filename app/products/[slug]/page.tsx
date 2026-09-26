"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";

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

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const supabase = createClient();

  const {
    items,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, compare_at_price, stock, image_url"
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Product load error:", error);
        setProduct(null);
      } else {
        setProduct(data);

        const { data: imageData, error: imagesError } = await supabase
          .from("product_images")
          .select("id, image_url, sort_order")
          .eq("product_id", data.id)
          .order("sort_order", { ascending: true });

        if (imagesError) {
          console.error("Product images load error:", imagesError);
        }

        const loadedImages = imageData || [];

        if (loadedImages.length === 0 && data.image_url) {
          setImages([
            {
              id: "main-image",
              image_url: data.image_url,
              sort_order: 0,
            },
          ]);

          setSelectedImage(data.image_url);
        } else {
          setImages(loadedImages);

          setSelectedImage(
            loadedImages[0]?.image_url || data.image_url || null
          );
        }
      }

      setLoading(false);
    };

    loadProduct();
  }, [slug]);

  const cartItem = product
    ? items.find((item) => item.id === product.id)
    : undefined;

  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image_url: product.image_url,
      stock: product.stock,
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleIncrease = () => {
    if (!product || quantity >= product.stock) return;

    increaseQuantity(product.id);
  };

  const handleDecrease = () => {
    if (!product || quantity <= 0) return;

    decreaseQuantity(product.id);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 text-white">
        <div className="text-center">
          <div className="text-5xl">😕</div>

          <h1 className="mt-4 text-2xl font-bold">
            Product not found
          </h1>

          <p className="mt-2 text-pink-100">
            This product may no longer be available.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const discount =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price)
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.price)) /
            Number(product.compare_at_price)) *
            100
        )
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/products"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Products
        </Link>

        <div className="mt-6 grid gap-8 rounded-[32px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:grid-cols-2 md:p-8">

          {/* Product Images */}
          <div>

            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-[24px] bg-white/10">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">
                  📦
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === image.image_url
                        ? "border-pink-400"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} thumbnail`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">

            <p className="text-sm font-medium text-pink-200">
              Mystery Scoop Delight
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              {product.name}
            </h1>

            {discount && (
              <div className="mt-4 inline-flex w-fit rounded-full bg-pink-500/30 px-4 py-2 text-sm font-semibold text-pink-100">
                {discount}% OFF 🎉
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-white">
                ₹{Number(product.price).toFixed(2)}
              </span>

              {product.compare_at_price &&
                Number(product.compare_at_price) >
                  Number(product.price) && (
                  <span className="text-lg text-pink-200/70 line-through">
                    ₹{Number(product.compare_at_price).toFixed(2)}
                  </span>
                )}
            </div>

            {product.description && (
              <p className="mt-6 leading-7 text-pink-100">
                {product.description}
              </p>
            )}

            {/* Stock */}
            <div className="mt-6">
              {product.stock > 0 ? (
                <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-100">
                  ✓ In Stock — {product.stock} available
                </span>
              ) : (
                <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Add to Cart / Quantity */}
            {product.stock > 0 && quantity > 0 ? (
              <div className="mt-8">

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">

                  <p className="mb-3 text-center text-sm font-medium text-pink-100">
                    {addedToCart
                      ? "Added to Cart ✓"
                      : "Quantity"}
                  </p>

                  <div className="flex items-center justify-center gap-5">

                    {/* Minus */}
                    <button
                      type="button"
                      onClick={handleDecrease}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl font-bold text-white shadow-lg transition hover:scale-105 hover:bg-white/25 disabled:opacity-40"
                      disabled={quantity <= 0}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    {/* Quantity */}
                    <span className="min-w-10 text-center text-2xl font-bold text-white">
                      {quantity}
                    </span>

                    {/* Plus */}
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-2xl font-bold text-white shadow-lg shadow-pink-500/30 transition hover:scale-105 hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  {quantity >= product.stock && (
                    <p className="mt-3 text-center text-xs text-pink-200">
                      Maximum available quantity reached.
                    </p>
                  )}

                </div>

              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="mt-8 w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {product.stock <= 0
                  ? "Out of Stock"
                  : "Add to Cart 🛒"}
              </button>
            )}

            {/* Go to Cart */}
            {quantity > 0 && (
              <Link
                href="/cart"
                className="mt-4 w-full rounded-full border border-white/25 bg-white/10 px-6 py-4 text-center font-semibold text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                View Cart 🛒
              </Link>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}