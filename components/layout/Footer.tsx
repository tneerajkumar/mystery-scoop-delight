import { Heart, Sparkles } from "lucide-react";

function InstagramIcon({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3.2" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsappIcon({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21.7 12.3c0 5.2-4.2 9.4-9.4 9.4-1.7 0-3.3-.4-4.7-1.2L3 21l1.5-4.6C3.8 14.5 3.5 13 3.5 11.6 3.5 6.4 7.7 2.2 12.9 2.2S21.7 6.4 21.7 11.6z" />
      <path d="M17 14.5c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.46-.89-.79-1.49-1.77-1.66-2.07-.17-.3 0-.46.14-.61.14-.14.3-.34.45-.51.15-.17.2-.28.3-.46.1-.18.05-.34-.02-.48-.07-.14-.67-1.63-.92-2.23-.24-.58-.48-.5-.66-.5-.17 0-.36 0-.55 0-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.12 2.83.14.18 1.93 2.95 4.68 4.03 2.75 1.08 2.75.72 3.25.67.5-.05 1.59-.64 1.82-1.26.23-.62.23-1.15.16-1.26-.07-.1-.27-.15-.57-.3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/15 py-12">
      <div className="grid gap-10 md:grid-cols-3 md:items-start">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-200" />

            <h2 className="text-xl font-bold text-white">
              Mystery Scoop Delight
            </h2>
          </div>

          <p className="mt-4 max-w-sm leading-7 text-pink-100">
            Every box holds a cute surprise. Discover adorable accessories,
            exciting finds and delightful mystery scoops curated with love.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white">
            Quick Links
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-pink-100">
            <a
              href="#"
              className="transition hover:text-white"
            >
              Home
            </a>

            <a
              href="#scoops"
              className="transition hover:text-white"
            >
              Choose Your Scoop
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#waitlist"
              className="transition hover:text-white"
            >
              Join Waitlist
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white">
            Stay Connected
          </h3>

          <p className="mt-4 text-pink-100">
            Follow us for cute surprises, updates and launch announcements.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://www.instagram.com/mystery_scoop_delight?igsh=eXM2MG8zaXpienJq"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:scale-110 hover:bg-pink-500"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>

            <a
              href={(() => {
                const raw = "8271683053";
                const normalized = raw.replace(/[^0-9]/g, "");
                const withCountry = normalized.length === 10 ? `91${normalized}` : normalized;
                return `https://wa.me/${withCountry}`;
              })()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:scale-110 hover:bg-pink-500"
            >
              <WhatsappIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-sm text-pink-100 md:flex-row">
        <p>
          © {new Date().getFullYear()} Mystery Scoop Delight. All rights reserved.
        </p>

        <p className="flex items-center gap-1">
          Made with
          <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
          for cute surprises
        </p>
      </div>
    </footer>
  );
}