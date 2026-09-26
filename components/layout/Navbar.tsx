"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const navLinks = [
  { name: "Home", href: "#" },
  { name: "What's Inside", href: "#whats-inside" },
  { name: "Scoops", href: "#scoops" },
  { name: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        setUserName(profile?.full_name || "");
        setIsAdmin(profile?.role === "admin");
      } else {
        setUserName("");
        setIsAdmin(false);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const loggedInUser = session?.user ?? null;

      setUser(loggedInUser);

      if (loggedInUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", loggedInUser.id)
          .single();

        setUserName(profile?.full_name || "");
        setIsAdmin(profile?.role === "admin");
      } else {
        setUserName("");
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScroll = (id: string) => {
  setIsDropdownOpen(false);

  // Already on Home page
  if (window.location.pathname === "/") {
    if (id === "#") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const element = document.getElementById(id.replace("#", ""));

    if (!element) return;

    const navbarOffset = 90;

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementPosition - navbarOffset,
      behavior: "smooth",
    });

    return;
  }

  // From any other page, go to Home first
  if (id === "#") {
    router.push("/");
    return;
  }

  router.push(`/${id}`);
};

  const handleLogout = async () => {
    setIsDropdownOpen(false);

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-[90] w-full">
      {/* Full rectangular navbar */}
      <div className="w-full border-b border-white/15 bg-[#6A11CB]/95 shadow-lg backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setIsDropdownOpen(false)}
            className="flex shrink-0 items-center"
          >
            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
              <Image
                src="/logo.png"
                alt="Mystery Scoop Delight"
                fill
                priority
                sizes="56px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleScroll(link.href)}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* User */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15 sm:px-4"
                >
                  <span className="hidden sm:inline">
                    Hi {userName || "there"}! 👋
                  </span>

                  <span className="sm:hidden">👤</span>

                  <span
                    className={`text-[10px] transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-white/15 bg-[#6A11CB]/95 p-2 shadow-2xl backdrop-blur-2xl">
                    <Link
                      href="/account"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      👤 My Account
                    </Link>

                    <Link
                      href="/account/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      ✏️ My Profile
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      📦 My Orders
                    </Link>

                    <Link
                      href="/account/addresses"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      📍 My Addresses
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-pink-100 transition-colors hover:bg-white/10"
                      >
                        🛠️ Admin Panel
                      </Link>
                    )}

                    <div className="my-1 border-t border-white/10" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15 sm:px-4"
              >
                🔐 Login
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg border border-pink-300/30 bg-gradient-to-r from-pink-500 to-fuchsia-500 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-pink-500/30 sm:px-4"
            >
              🛒
              <span className="hidden sm:inline">Cart</span>

              {totalItems > 0 && (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-extrabold text-pink-600">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}