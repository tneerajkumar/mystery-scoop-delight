"use client";

import { usePathname } from "next/navigation";
import FloatingCart from "@/components/cart/FloatingCart";

export default function GlobalCart() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <FloatingCart />;
}