export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-700 to-pink-500 flex items-center justify-center px-6">
      <div className="max-w-xl w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-10 text-center text-white">

        <div className="text-6xl mb-6">✨</div>

        <h1 className="text-5xl font-bold mb-4">
          Mystery Scoop Delight
        </h1>

        <p className="text-xl text-purple-100 mb-8">
          Beauty is on its way.
        </p>

        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-3">
            🚀 Coming Soon
          </h2>

          <p className="text-purple-100 leading-7">
            We're creating a premium destination for personal cosmetic products.
            Stay tuned for carefully selected beauty essentials that bring confidence,
            elegance, and everyday delight.
          </p>
        </div>

        <p className="text-sm text-purple-200">
          © 2026 Mystery Scoop Delight
        </p>

      </div>
    </main>
  );
}