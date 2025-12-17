"use client";

import { useEffect } from "react";
import { Hero } from "@/components/hero";
import { Overview } from "@/components/overview";
import { Features } from "@/components/features";
import { Waitlist } from "@/components/waitlist";
import { Footer } from "@/components/footer";
import { trackPageView } from "@/lib/analytics";

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