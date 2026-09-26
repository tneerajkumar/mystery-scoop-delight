"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function CheckoutPage() {
  const {
  items,
  subtotal,
  totalItems,
  clearCart,
} = useCart();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const selectedAddress = addresses.find(
  (address) => address.id === selectedAddressId
);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
const [orderError, setOrderError] = useState("");
const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
  const loadCheckoutData = async () => {
    setLoadingAddresses(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setAddresses([]);
      setSelectedAddressId(null);
      setLoadingAddresses(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("addresses")
      .select(
  `
    id,
    recipient_name,
    phone,
    address_line1,
    address_line2,
    landmark,
    city,
    state,
    pincode,
    is_default
  `
)
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Address load error:", error);
      setAddresses([]);
      setLoadingAddresses(false);
      return;
    }

    const loadedAddresses = data || [];

    setAddresses(loadedAddresses);

    // Automatically select the default address,
    // otherwise select the first saved address.
    const defaultAddress =
      loadedAddresses.find((address) => address.is_default) ||
      loadedAddresses[0];

    setSelectedAddressId(defaultAddress?.id || null);
    setLoadingAddresses(false);
  };

  loadCheckoutData();
}, [supabase]);

const handlePlaceOrder = async () => {
  setOrderError("");

  if (!userId) {
    setOrderError("Please log in before placing your order.");
    return;
  }

  if (!selectedAddressId) {
    setOrderError("Please select a delivery address.");
    return;
  }

  if (items.length === 0) {
    setOrderError("Your cart is empty.");
    return;
  }

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  );

  if (!selectedAddress) {
    setOrderError("Selected address could not be found.");
    return;
  }

  setPlacingOrder(true);

  const shippingAddress = {
    recipient_name: selectedAddress.recipient_name,
    phone: selectedAddress.phone,
    address_line1: selectedAddress.address_line1,
    address_line2: selectedAddress.address_line2,
    landmark: selectedAddress.landmark,
    city: selectedAddress.city,
    state: selectedAddress.state,
    pincode: selectedAddress.pincode,
  };

  const orderItems = items.map((item) => ({
    product_id: item.id,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc("create_order", {
    p_items: orderItems,
    p_shipping_address: shippingAddress,
  });

  if (error) {
    console.error("Create order error:", error);
    setOrderError(error.message);
    setPlacingOrder(false);
    return;
  }

  if (!data) {
    setOrderError("Order could not be created.");
    setPlacingOrder(false);
    return;
  }

  clearCart();

  // Store the new order ID temporarily.
  sessionStorage.setItem("mystery-scoop-last-order", data);

  // Go to order confirmation.
  await handlePayment(data);
};

useEffect(() => {
  if (document.getElementById("razorpay-checkout-js")) {
    return;
  }

  const script = document.createElement("script");

  script.id = "razorpay-checkout-js";
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;

  document.body.appendChild(script);

  return () => {
    const existingScript = document.getElementById(
      "razorpay-checkout-js"
    );

    if (existingScript) {
      existingScript.remove();
    }
  };
}, []);

const handlePayment = async (orderId: string) => {
  try {
    setPaymentLoading(true);
    setOrderError("");

    const response = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to create payment order."
      );
    }

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay Checkout could not be loaded. Please refresh and try again."
      );
    }

    const options = {
      key: data.keyId,

      amount: data.amount,

      currency: data.currency,

      name: "Mystery Scoop Delight",

      description: "Beauty products",

      order_id: data.razorpayOrderId,

      image: "/logo.png",

      theme: {
        color: "#F72585",
      },

      modal: {
        confirm_close: true,
        escape: true,
        backdropclose: false,
      },

      handler: async function (response: any) {
  try {
    setPaymentLoading(true);
    setOrderError("");

    const verifyResponse = await fetch(
      "/api/razorpay/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          razorpayPaymentId:
            response.razorpay_payment_id,
          razorpayOrderId:
            response.razorpay_order_id,
          razorpaySignature:
            response.razorpay_signature,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(
        verifyData.error ||
          "Payment verification failed."
      );
    }

    if (!verifyData.success) {
      throw new Error(
        "Payment could not be verified."
      );
    }

    // Payment is now verified by our server.
    window.location.href =
      `/payment-success?order_id=${encodeURIComponent(
        orderId
      )}`;
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    setOrderError(
      error instanceof Error
        ? error.message
        : "Payment verification failed."
    );

    setPaymentLoading(false);
  }
},

      prefill: {
        name: selectedAddress?.recipient_name || "",
        contact: selectedAddress?.phone || "",
      },

      notes: {
        order_id: orderId,
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", async function (response: any) {
  console.log("Razorpay payment failed:", response);

  let stockReleaseFailed = false;

  try {
    const releaseResponse = await fetch(
      "/api/razorpay/release-stock",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      }
    );

    const releaseData = await releaseResponse.json();

    console.log(
      "Stock release response:",
      releaseResponse.status,
      releaseData
    );

    if (!releaseResponse.ok) {
      stockReleaseFailed = true;

      setOrderError(
        releaseData?.error ||
          "Payment failed, but reserved stock could not be released."
      );
    }
  } catch (error) {
    console.log(
      "Stock release request failed:",
      error
    );

    stockReleaseFailed = true;

    setOrderError(
      "Payment failed, but reserved stock could not be released."
    );
  }

  if (!stockReleaseFailed) {
    setOrderError(
      response?.error?.description ||
        "Payment failed. Your reserved stock has been released. Please try again."
    );
  }

  setPaymentLoading(false);
});
    razorpay.on("modal.closed", function () {
  setPaymentLoading(false);

  setOrderError(
    "Payment window closed. Your order is still pending. You can try payment again."
  );
});

    razorpay.open();
  } catch (error) {
    console.error("Payment error:", error);

    setOrderError(
      error instanceof Error
        ? error.message
        : "Unable to start payment."
    );

    setPaymentLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm text-pink-200 transition hover:text-white"
        >
          ← Back to Cart
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-pink-200">
            Mystery Scoop Delight
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Checkout ✨
          </h1>

          <p className="mt-2 text-sm text-pink-100">
            Review your order before continuing.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[32px] border border-white/20 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="text-6xl">🛒</div>

            <h2 className="mt-4 text-2xl font-bold text-white">
              Your cart is empty
            </h2>

            <p className="mt-2 text-pink-100">
              Add some beautiful products before checking out.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-purple-700 transition hover:scale-105"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Checkout Details - we'll add login and address here */}
            <div className="lg:col-span-2 rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <h2 className="text-xl font-bold text-white">
      Delivery Address
    </h2>

    {userId && (
      <Link
        href="/account/addresses"
        className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Manage Addresses
      </Link>
    )}
  </div>

  {loadingAddresses ? (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-pink-100">
      Loading your addresses...
    </div>
  ) : !userId ? (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-pink-100">
        Please log in to select a delivery address and continue with checkout.
      </p>

      <Link
        href="/login"
        className="mt-4 inline-block rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600"
      >
        Login to Continue
      </Link>
    </div>
  ) : addresses.length === 0 ? (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-pink-100">
        You don't have any saved delivery addresses yet.
      </p>

      <Link
        href="/account/addresses"
        className="mt-4 inline-block rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600"
      >
        Add Delivery Address
      </Link>
    </div>
  ) : (
    <div className="mt-5 space-y-3">
      {addresses.map((address) => {
        const isSelected = selectedAddressId === address.id;

        return (
          <button
            key={address.id}
            type="button"
            onClick={() => setSelectedAddressId(address.id)}
            className={`w-full rounded-2xl border p-5 text-left transition ${
              isSelected
                ? "border-pink-400 bg-pink-500/20"
                : "border-white/15 bg-black/10 hover:border-white/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">
                    {address.recipient_name}
                  </p>

                  {address.is_default && (
                    <span className="rounded-full bg-pink-500/20 px-2 py-1 text-xs font-medium text-pink-100">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-pink-100">
                  {address.address_line1}
                  {address.address_line2
                    ? `, ${address.address_line2}`
                    : ""}
                </p>

                {address.landmark && (
  <p className="text-sm text-pink-100">
    Landmark: {address.landmark}
  </p>
)}

                <p className="text-sm text-pink-100">
                  {address.city}, {address.state} - {address.pincode}
                </p>

                <p className="mt-2 text-sm text-pink-200">
                  Phone: {address.phone}
                </p>
              </div>

              {isSelected && (
                <span className="shrink-0 rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
                  Selected ✓
                </span>
              )}
            </div>
          </button>
        );
      })}

      <Link
        href="/account/addresses"
        className="inline-block pt-2 text-sm font-medium text-pink-200 transition hover:text-white"
      >
        + Add another address
      </Link>

      {/* 👇 PLACE ORDER BUTTON GOES HERE */}
      {userId && addresses.length > 0 && (
  <div className="mt-8 border-t border-white/15 pt-6">
    {orderError && (
      <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
        {orderError}
      </div>
    )}

    <button
      type="button"
      onClick={handlePlaceOrder}
      disabled={placingOrder || !selectedAddressId}
      className="w-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-4 font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {placingOrder ? "Placing Order..." : "Place Order →"}
    </button>

    <p className="mt-3 text-center text-xs text-pink-200">
      Your order will be created securely. Payment will be handled next.
    </p>
  </div>
)}
    </div>
  )}
</div>

            {/* Order Summary */}
            <div className="h-fit rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          📦
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-pink-200">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/15 pt-5">
                <div className="flex justify-between text-sm text-pink-100">
                  <span>
                    Subtotal ({totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"})
                  </span>

                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="mt-3 flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <p className="mt-3 text-xs text-pink-200">
                  Shipping charges and payment options will be added next.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}