"use client";

import { motion } from "framer-motion";
import { serif, sans } from "@/lib/fonts";

export function Footer() {
  return (
    <footer className="bg-[#F0EFEA] border-t border-[#E5E3DE]">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16 lg:py-24">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-4`}>House of Muziris</h3>
            <p className={`${sans.className} text-[#6B6B6B] text-sm leading-relaxed`}>
              Preserving Kerala's spice legacy for generations to come.
            </p>
          </div>
          <div>
            <h4 className={`${sans.className} text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-4`}>Contact</h4>
            <p className={`${sans.className} text-[#6B6B6B] text-sm leading-loose`}>
              trade@houseofmuziris.com<br />
              +91 6282 855 001
            </p>
          </div>
          <div>
            <h4 className={`${sans.className} text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-4`}>Location</h4>
            <p className={`${sans.className} text-[#6B6B6B] text-sm leading-loose`}>
              Kochi, Kerala<br />
              India
            </p>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-[#E5E3DE] mb-8 origin-left"
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`${sans.className} text-xs text-[#6B6B6B]`}>
            © {new Date().getFullYear()} House of Muziris. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a
                key={link}
                href="#"
                className={`${sans.className} text-xs text-[#6B6B6B] hover:text-[#C5A059] transition-colors`}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
