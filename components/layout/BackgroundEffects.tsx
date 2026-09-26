export default function BackgroundEffects() {
  return (
    <>
      {/* Top Left */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[120px]" />

      {/* Top Right */}
      <div className="absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-[120px]" />

      {/* Bottom Left */}
      <div className="absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px]" />

      {/* Bottom Right */}
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />

      {/* Small floating circles */}
      <div className="absolute top-32 left-24 h-4 w-4 rounded-full bg-white/40" />
      <div className="absolute top-56 right-40 h-3 w-3 rounded-full bg-pink-300/50" />
      <div className="absolute bottom-40 left-1/3 h-3 w-3 rounded-full bg-white/40" />
      <div className="absolute bottom-24 right-1/4 h-4 w-4 rounded-full bg-purple-300/50" />

      {/* Sparkles */}
      <div className="absolute left-24 top-40 text-3xl animate-pulse">
        ✨
      </div>

      <div className="absolute right-36 top-72 text-2xl animate-pulse">
        🌸
      </div>

      <div className="absolute bottom-36 left-1/4 text-2xl animate-pulse">
        ✨
      </div>

      <div className="absolute bottom-52 right-1/3 text-3xl animate-pulse">
        💖
      </div>
    </>
  );
}