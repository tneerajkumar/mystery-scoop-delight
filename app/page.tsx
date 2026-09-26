"use client";

import { useEffect } from "react";
import BackgroundEffects from "@/components/layout/BackgroundEffects";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/hero/Hero";
import WhatsInside from "@/components/home/WhatsInside";
import FeaturedBoxes from "@/components/home/FeaturedBoxes";
import UnboxingPreview from "@/components/home/UnboxingPreview";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";
import Newsletter from "@/components/home/Newsletter";
import SmoothScroll from "@/components/scroll/SmoothScroll";

export default function Home() {

useEffect(() => {
  const hash = window.location.hash;

  if (!hash) return;

  const scrollToSection = () => {
    const element = document.getElementById(hash.replace("#", ""));

    if (!element) return;

    const navbarOffset = 90;

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementPosition - navbarOffset,
      behavior: "smooth",
    });
  };

  const timer = window.setTimeout(scrollToSection, 100);

  return () => window.clearTimeout(timer);
}, []);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-[#6A11CB] via-[#8E44AD] to-[#F15BB5]">
      <SmoothScroll />
      <BackgroundEffects />

      <div className="relative z-10">
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Hero />

          <WhatsInside />

          <FeaturedBoxes />

          <UnboxingPreview />

          <WhyChooseUs />

          <HowItWorks />

          <Newsletter />

          <Footer />
        </div>
      </div>
    </main>
  );
}