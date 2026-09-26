import Logo from "./Logo";

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl scroll-mt-28 pt-10 sm:pt-14 md:pt-16 animate-fade-up">
      <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:rounded-[40px]">
        <div className="px-4 py-10 sm:px-8 sm:py-16 md:px-20 md:py-20">

          {/* Logo */}
          <Logo />

          {/* Heading */}
          <h1 className="mt-5 text-center text-3xl font-extrabold leading-tight text-white sm:mt-8 sm:text-5xl md:text-7xl">
            Mystery Scoop

            <span className="block bg-gradient-to-r from-pink-200 via-white to-pink-300 bg-clip-text text-transparent">
              Delight
            </span>
          </h1>

          {/* Tagline */}
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm font-semibold text-pink-100 sm:mt-6 sm:text-2xl">
            Every Box Holds a Beautiful Surprise
          </p>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-6 text-purple-100 sm:mt-8 sm:text-lg sm:leading-8">
            Discover premium mystery beauty boxes filled with
            skincare, makeup, beauty accessories and delightful
            surprises curated specially for you.
          </p>

          {/* Explore Button */}
          <div className="mt-12 flex justify-center">
            <a
              href="#scoops"
              className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(236,72,153,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_40px_rgba(236,72,153,0.5)]"
            >
              Explore Scoops
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center sm:mt-14">
            <div className="text-xl sm:text-2xl">
              ⭐⭐⭐⭐⭐
            </div>

            <p className="mt-2 text-sm text-pink-100 sm:mt-3 sm:text-base">
              Discover something beautiful in every scoop.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}