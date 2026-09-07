import "./globals.css";

export const metadata = {
  title: "LIFETIMEBETS",
  description: "One play. Every day.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
