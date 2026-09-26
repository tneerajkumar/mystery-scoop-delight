import Image from "next/image";

export default function Logo() {
  return (
    <div className="mb-6 flex justify-center sm:mb-8">

      <div className="relative">

        {/* Outer Glow */}
        <div className="absolute inset-0 scale-110 rounded-full bg-pink-400/30 blur-3xl sm:scale-125"></div>

        {/* Glass Circle */}
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_15px_40px_rgba(255,255,255,0.15)] sm:h-44 sm:w-44">
          <Image
            src="/logo.png"
            alt="Mystery Scoop Delight"
            fill
            priority
            sizes="112px"
            className="object-cover object-center scale-[1.5] select-none sm:scale-[1.45]"
          />

        </div>

      </div>

    </div>
  );
}