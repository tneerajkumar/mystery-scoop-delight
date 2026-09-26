"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  is_active: boolean;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "0",
  image_url: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const loadProducts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.replace("/account");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, compare_at_price, stock, image_url, is_active"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products load error:", error);
      setMessage(`Unable to load products: ${error.message}`);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = e.target.value;

    setForm((current) => ({
      ...current,
      name,
      slug: editingId ? current.slug : generateSlug(name),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleToggleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((current) => ({
      ...current,
      is_active: e.target.checked,
    }));
  };

  const uploadProductImages = async () => {
    if (selectedImages.length === 0) {
      return [];
    }

    const uploadedUrls: string[] = [];

    for (const image of selectedImages) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, image);

      if (error) {
        throw new Error(error.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSaveProduct = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    let uploadedImageUrls: string[] = [];

try {
  if (selectedImages.length > 0) {
    uploadedImageUrls = await uploadProductImages();
  }
} catch (error) {
  console.error("Image upload error:", error);

  setSaving(false);
  setMessage(
    error instanceof Error
      ? `Image upload failed: ${error.message}`
      : "Image upload failed."
  );
  return;
}

    const productData = {
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      description: form.description.trim() || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price
        ? Number(form.compare_at_price)
        : null,
      stock: Number(form.stock),
      image_url:
  uploadedImageUrls.length > 0
    ? uploadedImageUrls[0]
    : form.image_url.trim() || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let productId = editingId;

if (editingId) {
  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", editingId);

  if (error) {
    setSaving(false);
    setMessage(`Unable to save product: ${error.message}`);
    return;
  }
} else {
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select("id")
    .single();

  if (error || !data) {
    setSaving(false);
    setMessage(
      `Unable to save product: ${error?.message || "Product was not created"}`
    );
    return;
  }

  productId = data.id;
}

if (productId && uploadedImageUrls.length > 0) {
  const imageRecords = uploadedImageUrls.map((imageUrl, index) => ({
    product_id: productId,
    image_url: imageUrl,
    sort_order: index,
  }));

  const { error: imagesError } = await supabase
    .from("product_images")
    .insert(imageRecords);

  if (imagesError) {
    console.error("Product images save error:", imagesError);
    setSaving(false);
    setMessage(
      `Product saved, but images could not be linked: ${imagesError.message}`
    );
    return;
  }
}
    setSaving(false);
   setForm({ ...emptyForm });
   setSelectedImages([]);
   setEditingId(null);

    setMessage(
      editingId
        ? "Product updated successfully! ✨"
        : "Product added successfully! 🎉"
    );

    await loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price),
      compare_at_price: product.compare_at_price
        ? String(product.compare_at_price)
        : "",
      stock: String(product.stock),
      image_url: product.image_url || "",
      is_active: product.is_active,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Product delete error:", error);
      setMessage(`Unable to delete product: ${error.message}`);
      return;
    }

    setMessage("Product deleted successfully.");
    await loadProducts();
  };

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
          href="/admin"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Manage Products 📦
          </h1>

          <p className="mt-3 text-sm text-pink-100">
            Add, edit, activate, or remove products.
          </p>

          {/* Product Form */}
          <div className="mt-8 border-t border-white/15 pt-8">
            <h2 className="text-xl font-semibold text-white">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>

            <form
              onSubmit={handleSaveProduct}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Product name"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="product-slug"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Product description"
                rows={4}
                className="md:col-span-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Selling price"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at_price}
                onChange={handleChange}
                placeholder="Original price (optional)"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="Available stock"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
  <label className="mb-2 block text-sm font-medium text-white">
    Product Image
  </label>

  <input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) =>
    setSelectedImages(
      e.target.files ? Array.from(e.target.files) : []
    )
  }
  className="block w-full text-sm text-pink-100 file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-pink-600"
/>

  {selectedImages.length > 0 && (
  <p className="mt-2 text-xs text-pink-200">
    {selectedImages.length} image
    {selectedImages.length > 1 ? "s" : ""} selected
  </p>
)}
</div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleToggleChange}
                  className="h-4 w-4"
                />
                Active — visible to customers
              </label>

              <button
                type="submit"
                disabled={saving}
                className="md:col-span-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-70"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>
            </form>
          </div>

          {message && (
            <p className="mt-5 text-center text-sm text-pink-100">
              {message}
            </p>
          )}

          {/* Product List */}
          <div className="mt-10 border-t border-white/15 pt-8">
            <h2 className="text-xl font-semibold text-white">
              All Products ({products.length})
            </h2>

            {products.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/10 p-8 text-center text-pink-100">
                No products added yet.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
  <div className="flex items-start gap-4">
    {/* Product Image */}
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl">
          📦
        </div>
      )}
    </div>

    {/* Product Details */}
    <div>
      <h3 className="font-semibold text-white">
        {product.name}
      </h3>

      <p className="mt-1 text-sm text-pink-100">
        ₹{Number(product.price).toFixed(2)}

        {product.compare_at_price && (
          <span className="ml-2 text-pink-200/70 line-through">
            ₹{Number(product.compare_at_price).toFixed(2)}
          </span>
        )}
      </p>

      <p className="mt-2 text-xs text-pink-200">
        Stock: {product.stock} •{" "}
        {product.is_active ? "Active" : "Inactive"}
      </p>
    </div>
  </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-full border border-white/20 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-full border border-red-300/30 px-3 py-2 text-sm text-red-100 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}