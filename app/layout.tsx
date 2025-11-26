import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crystal Essence",
  description: "E-commerce platform for crystal merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
