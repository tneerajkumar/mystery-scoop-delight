"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const emptyForm = {
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadAddresses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Addresses load error:", error);
      setMessage(`Unable to load addresses: ${error.message}`);
    } else {
      setAddresses(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (address: Address) => {
  setEditingId(address.id);

  setForm({
    recipient_name: address.recipient_name,
    phone: address.phone,
    address_line1: address.address_line1,
    address_line2: address.address_line2 || "",
    landmark: address.landmark || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  });

  setMessage("");
};

  const handleSaveAddress = async  (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const isFirstAddress = addresses.length === 0;

const addressData = {
  recipient_name: form.recipient_name.trim(),
  phone: form.phone.trim(),
  address_line1: form.address_line1.trim(),
  address_line2: form.address_line2.trim() || null,
  landmark: form.landmark.trim() || null,
  city: form.city.trim(),
  state: form.state.trim(),
  pincode: form.pincode.trim(),
};

const { error } = editingId
  ? await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", editingId)
      .eq("user_id", user.id)
  : await supabase.from("addresses").insert({
      ...addressData,
      user_id: user.id,
      is_default: isFirstAddress,
    });

    setSaving(false);

    if (error) {
      console.error("Address add error:", error);
      setMessage(`Unable to save address: ${error.message}`);
      return;
    }

    setForm(emptyForm);
setEditingId(null);

setMessage(
  editingId
    ? "Address updated successfully! ✨"
    : "Address saved successfully! 🏠"
);

await loadAddresses();
  };

  const setDefaultAddress = async (addressId: string) => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Remove default status from all current user's addresses
    const { error: resetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (resetError) {
      setMessage(`Unable to update default address: ${resetError.message}`);
      return;
    }

    // Set selected address as default
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (error) {
      setMessage(`Unable to set default address: ${error.message}`);
      return;
    }

    setMessage("Default address updated! ✨");
    await loadAddresses();
  };

  const deleteAddress = async (addressId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this address?"
  );

  if (!confirmed) return;

  setMessage("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.replace("/login");
    return;
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    setMessage(`Unable to delete address: ${error.message}`);
    return;
  }

  setMessage("Address deleted.");
  await loadAddresses();
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] text-white">
        Loading your addresses...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-block text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to My Account
        </Link>

        <div className="mt-5 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            My Addresses 🏠
          </h1>

          <p className="mt-3 text-sm text-pink-100">
            Save your delivery addresses for faster checkout.
          </p>

          {/* Saved addresses */}
          <div className="mt-8 space-y-4">
            {addresses.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/10 p-6 text-center text-pink-100">
                No saved addresses yet.
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-3xl border border-white/15 bg-white/10 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-white">
                          {address.recipient_name}
                        </h2>

                        {address.is_default && (
                          <span className="rounded-full bg-pink-500/30 px-3 py-1 text-xs text-pink-100">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-pink-100">
                        {address.address_line1}
                        {address.address_line2 &&
                          `, ${address.address_line2}`}
                        {address.landmark && `, ${address.landmark}`}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                        <br />
                        Phone: {address.phone}
                      </p>
                    </div>

                    <div className="flex gap-3 self-start">
                        <button
  onClick={() => handleEdit(address)}
  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
>
  Edit
</button>
                      {!address.is_default && (
                        <button
                          onClick={() => setDefaultAddress(address.id)}
                          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add address form */}
          <div className="mt-10 border-t border-white/15 pt-8">
            <h2 className="text-xl font-semibold text-white">
  {editingId ? "Edit Address" : "Add New Address"}
</h2>

            <form
              onSubmit={handleSaveAddress}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <input
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                placeholder="Recipient name"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="address_line1"
                value={form.address_line1}
                onChange={handleChange}
                placeholder="House / Flat / Building"
                required
                className="sm:col-span-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="address_line2"
                value={form.address_line2}
                onChange={handleChange}
                placeholder="Area / Street (optional)"
                className="sm:col-span-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Landmark (optional)"
                className="sm:col-span-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="PIN code"
                required
                className="sm:col-span-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-pink-100/70"
              />

              <button
                type="submit"
                disabled={saving}
                className="sm:col-span-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-70"
              >
                {saving
  ? "Saving..."
  : editingId
    ? "Update Address"
    : "Save Address"}
              </button>
            </form>

            {message && (
              <p className="mt-5 text-center text-sm text-pink-100">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}