import { ShoppingBag, Sparkles, PackageCheck, Heart } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Your Scoop",
    description:
      "Pick your favourite scoop based on your budget and how big you want your surprise to be.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "Place Your Order",
    description:
      "Select your scoop and place your order securely. Then the mystery begins!",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "We Curate & Pack",
    description:
      "We carefully select cute accessories and surprises, then pack your order with love.",
    icon: PackageCheck,
  },
  {
    number: "04",
    title: "Unbox Happiness",
    description:
      "Receive your Mystery Scoop Delight package and discover your adorable surprises.",
    icon: Heart,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-24">
      {/* Heading */}
      <div className="text-center">
        <span className="rounded-full border border-pink-300/30 bg-pink-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-pink-100">
          How It Works
        </span>

        <h2 className="mt-6 text-4xl font-extrabold text-white md:text-5xl">
          Your Surprise Journey Starts Here
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-pink-100">
          Four simple steps stand between you and a box full of cute surprises.
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-8 text-center shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl"
            >
              {/* Step Number */}
              <span className="absolute right-5 top-5 text-sm font-bold text-pink-200/70">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500 shadow-lg">
                <Icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-purple-100">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <div className="mt-14 text-center">
        <p className="text-lg font-medium text-pink-100">
          Choose your scoop. Leave the rest to us.
        </p>
      </div>
    </section>
  );
}