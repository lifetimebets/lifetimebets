import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://lifetimebets.com"),
  title: "LIFETIMEBETS — One Play. Every Day.",
  description: "Live sports odds, automatic daily pick, bankroll tracking and performance calendar.",
  applicationName: "LIFETIMEBETS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "LIFETIMEBETS — One Play. Every Day.",
    description: "Live sports odds, automatic daily pick, bankroll tracking and performance calendar.",
    url: "https://lifetimebets.com",
    siteName: "LIFETIMEBETS",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LIFETIMEBETS LB logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LIFETIMEBETS — One Play. Every Day.",
    description: "Live sports odds and an automatic daily moneyline pick.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
