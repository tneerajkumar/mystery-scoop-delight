import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import GlobalCart from "@/components/layout/GlobalCart";
import GlobalNavbar from "@/components/layout/GlobalNavbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mysteryscoopdelight.com"),

  title: {
    default: "Mystery Scoop Delight",
    template: "%s | Mystery Scoop Delight",
  },

  description:
    "Discover premium personal cosmetic products curated to inspire confidence, elegance and everyday beauty.",

  keywords: [
    "beauty",
    "cosmetics",
    "personal care",
    "skin care",
    "Mystery Scoop Delight",
  ],

  authors: [{ name: "Mystery Scoop Delight" }],

  creator: "Mystery Scoop Delight",

  publisher: "Mystery Scoop Delight",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Mystery Scoop Delight",
    description:
      "Beauty is on its way.",
    url: "https://www.mysteryscoopdelight.com",
    siteName: "Mystery Scoop Delight",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mystery Scoop Delight",
    description:
      "Beauty is on its way.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
  <GlobalNavbar />
  {children}
  <GlobalCart />
</CartProvider>
      </body>
    </html>
  );
}