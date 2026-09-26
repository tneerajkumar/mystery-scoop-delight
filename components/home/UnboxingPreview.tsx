import {
  Gift,
  Heart,
  Gem,
  Sparkles,
  CircleDot,
  KeyRound,
  PackageOpen,
  Ribbon,
} from "lucide-react";

const surprises = [
  {
    title: "Hair Accessories",
    description: "Claw clips, hair clips and more.",
    icon: Ribbon,
  },
  {
    title: "Cute Scrunchies",
    description: "Fun styles and adorable designs.",
    icon: CircleDot,
  },
  {
    title: "Fashion Jewellery",
    description: "Earrings and bracelets to accessorize.",
    icon: Gem,
  },
  {
    title: "Lip Essentials",
    description: "Cute lip balms for everyday use.",
    icon: Heart,
  },
  {
    title: "Cute Keychains",
    description: "Little accessories with lots of personality.",
    icon: KeyRound,
  },
  {
    title: "Secret Surprise",
    description: "An extra mystery waiting to be discovered.",
    icon: Gift,
  },
];

export default function UnboxingPreview() {
  return (
    <section className="py-24">
      {/* Section Heading */}
      <div className="text-center">
        <span className="rounded-full border border-pink-300/30 bg-pink-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-pink-100">
          The Mystery Awaits
        </span>

        <h2 className="mt-6 text-4xl font-extrabold text-white md:text-5xl">
          What Could Be Inside Your Scoop?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-pink-100">
          Every scoop is different! You never know exactly what adorable
          surprises are waiting inside until it's time to unbox.
        </p>
      </div>

      {/* Main Mystery Box */}
      <div className="relative mx-auto mt-16 flex max-w-3xl justify-center">
        {/* Glow */}
        <div className="absolute top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-pink-400/20 blur-3xl" />

        <div className="relative flex h-40 w-40 items-center justify-center rounded-[40px] border border-white/20 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/30 to-purple-500/30 shadow-2xl backdrop-blur-xl md:h-52 md:w-52">
          <PackageOpen className="h-20 w-20 text-white md:h-28 md:w-28" />

          <Sparkles className="absolute -left-8 -top-6 h-8 w-8 text-pink-200" />
          <Sparkles className="absolute -right-8 top-2 h-6 w-6 text-yellow-200" />
          <Sparkles className="absolute -bottom-5 right-4 h-7 w-7 text-fuchsia-200" />
        </div>
      </div>

      {/* Surprise Items */}
      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {surprises.map((surprise) => {
          const Icon = surprise.icon;

          return (
            <div
              key={surprise.title}
              className="group relative flex items-start gap-5 overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500">
                <Icon className="h-7 w-7 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {surprise.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-purple-100">
                  {surprise.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mystery Note */}
      <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-pink-300/20 bg-pink-500/10 p-6 text-center backdrop-blur-xl">
        <p className="text-base leading-7 text-pink-100">
          <span className="font-bold text-white">The best part?</span>{" "}
          Every order is a surprise. The items shown are examples of what may
          be included, and each Mystery Scoop Delight order is curated
          differently.
        </p>
      </div>
    </section>
  );
}