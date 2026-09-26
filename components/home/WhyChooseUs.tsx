import {
  ShieldCheck,
  Sparkles,
  Truck,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description:
      "Every product is carefully selected before it reaches your mystery box.",
  },
  {
    icon: Sparkles,
    title: "Every Box is Unique",
    description:
      "No two mystery boxes are exactly the same. Every order is a new surprise.",
  },
  {
    icon: Truck,
    title: "PAN India Delivery",
    description:
      "Fast and secure shipping across India with careful packaging.",
  },
  {
    icon: Gift,
    title: "Packed with Love",
    description:
      "Beautifully packed mystery boxes that make every unboxing exciting.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">

      <div className="text-center">

        <span className="rounded-full border border-pink-300/20 bg-pink-500/10 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-pink-100">
          Why Choose Us
        </span>

        <h2 className="mt-6 text-5xl font-bold text-white">
          More Than Just A Mystery Box
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg text-pink-100">
          Every Mystery Scoop Delight box is thoughtfully curated to bring
          happiness, excitement and adorable surprises to your doorstep.
        </p>

      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-[30px] border border-white/15 bg-white/10 p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/15"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500">

                <Icon className="h-8 w-8 text-white" />

              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-purple-100">
                {feature.description}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}