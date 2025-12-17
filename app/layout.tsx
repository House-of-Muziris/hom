import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { Cursor } from "@/components/cursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "House of Muziris — Where Empires Came for Spice",
  description: "Experience the legacy of Kerala's ancient spice trade. We supply the world's finest establishments with single-origin spices.",
  keywords: ["spices", "Kerala", "premium", "wholesale", "pepper", "cardamom"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="antialiased bg-[#F0EFEA] text-[#1A1A1A] selection:bg-[#C5A059]/30">
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
