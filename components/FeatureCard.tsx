type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-pink-300/40 hover:bg-white/15 hover:shadow-[0_20px_50px_rgba(255,255,255,0.15)] sm:p-7">

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl"></div>
      </div>

      <div className="relative">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg sm:h-16 sm:w-16 sm:text-4xl">
          {icon}
        </div>

        <h3 className="mt-5 text-xl font-bold text-white sm:mt-6 sm:text-2xl">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-purple-100 sm:text-base">
          {description}
        </p>

      </div>
    </div>
  );
}