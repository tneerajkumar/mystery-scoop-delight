"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function GlobalNavbar() {
  const pathname = usePathname();

  // Admin pages have their own navigation/header.
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Navbar />

      {/* Space reserved for the fixed Navbar */}
      <div className="h-[72px] w-full" aria-hidden="true" />
    </>
  );
}