"use client";

import { Hero } from "@/components/hero";
import { Overview } from "@/components/overview";
import { Features } from "@/components/features";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="bg-[#f8f6f3] dark:bg-[#0a0a0a] text-[#2b2b2b] dark:text-[#e5e3df]">
      <Hero />
      <Overview />
      <Features />
      <ContactForm />
      <Footer />
    </div>
  );
}