"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Hero } from "@/components/hero";
import { trackPageView } from "@/lib/analytics";

// Lazy load below-the-fold components for better initial load performance
const Overview = dynamic(() => import("@/components/overview").then(mod => ({ default: mod.Overview })), {
  loading: () => <div className="min-h-screen bg-[#EAE8E3]" />,
});

const Features = dynamic(() => import("@/components/features").then(mod => ({ default: mod.Features })), {
  loading: () => <div className="min-h-screen bg-[#1A1A1A]" />,
});

const Waitlist = dynamic(() => import("@/components/waitlist").then(mod => ({ default: mod.Waitlist })), {
  loading: () => <div className="min-h-screen bg-[#F0EFEA]" />,
});

const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })));

export default function Home() {
  useEffect(() => {
    trackPageView("Home");
  }, []);

  return (
    <main>
      <Hero />
      <Overview />
      <Features />
      <Waitlist />
      <Footer />
    </main>
  );
}