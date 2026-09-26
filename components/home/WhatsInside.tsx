import {
  Gift,
  Scissors,
  BadgePlus,
  Sparkles,
  Heart,
  Star,
  Package,
  Gem,
  CircleDot,
  Ribbon,
} from "lucide-react";

const items = [
  {
    icon: Scissors,
    title: "Hair Claw Clips",
    description: "Stylish claw clips in trendy colours and designs.",
  },
  {
    icon: Ribbon,
    title: "Hair Clips",
    description: "Cute everyday clips to complete your look.",
  },
  {
    icon: CircleDot,
    title: "Scrunchies",
    description: "Soft and comfortable scrunchies you'll love.",
  },
  {
    icon: Gem,
    title: "Fashion Earrings",
    description: "Elegant earrings selected for every style.",
  },
  {
    icon: Heart,
    title: "Lip Balm",
    description: "A little beauty essential for everyday care.",
  },
  {
    icon: Sparkles,
    title: "Compact Mirror",
    description: "Perfect for your handbag and daily touch-ups.",
  },
  {
    icon: BadgePlus,
    title: "Keychains",
    description: "Cute accessories to brighten your everyday carry.",
  },
  {
    icon: Star,
    title: "Bracelets",
    description: "Trendy bracelets to match every outfit.",
  },
  {
    icon: Package,
    title: "Cute Stickers",
    description: "Fun stickers for journals, laptops and gifts.",
  },
  {
    icon: Gift,
    title: "Secret Surprise",
    description: "Every box includes an extra surprise item.",
  },
];

export default function WhatsInside() {
  return (
    <section id="whats-inside" className="py-8 sm:py-10">

      <div className="text-center">

        <span className="rounded-full border border-pink-300/30 bg-pink-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pink-100 sm:px-5 sm:py-2 sm:text-sm">
          What's Inside?
        </span>

        <h2 className="mt-5 text-2xl font-bold text-white sm:mt-6 sm:text-4xl md:text-5xl">
          Every Box is Filled with Cute Surprises
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-pink-100 sm:mt-5 sm:text-lg sm:leading-8">
          Every Mystery Scoop Delight box contains a unique mix of adorable
          accessories and beauty essentials carefully curated to make every
          unboxing exciting.
        </p>

      </div>

      <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white sm:mt-5 sm:text-xl">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-purple-100 sm:mt-3">
                {item.description}
              </p>
            </div>
          );
        })}

      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-pink-300/20 bg-pink-500/10 p-5 text-center backdrop-blur-xl sm:mt-12 sm:p-6">
        <p className="text-sm leading-7 text-pink-100 sm:text-base">
          <strong>Every box is unique.</strong> The products shown above are
          examples of the types of items you may receive. Each Mystery Scoop
          Delight box is carefully curated with love and surprise.
        </p>
      </div>

    </section>
  );
}