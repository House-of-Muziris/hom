"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { serif, sans } from "@/lib/fonts";
import { theme, fadeUp, stagger } from "@/lib/theme";
import { getCurrentUser } from "@/lib/auth";
import { User } from "firebase/auth";

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  return (
    <section ref={ref} className="relative min-h-svh flex items-center overflow-hidden bg-[#F0EFEA]">
      {/* Grain Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

      <motion.div style={{ y: textY, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center py-12">
        <motion.div className="flex flex-col max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${sans.className} text-xs md:text-sm tracking-[0.3em] uppercase text-[#C5A059] mb-8`}
          >
            Est. Muziris · 30 BCE
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${serif.className} text-[clamp(3rem,8vw,6rem)] leading-[0.98] text-[#1A1A1A] font-medium mb-1`}
          >
            Where Rome
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${serif.className} text-[clamp(3rem,8vw,6rem)] leading-[0.98] text-[#1A1A1A] font-normal italic`}
          >
            Traded Gold
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${sans.className} mt-8 text-base md:text-lg text-[#6B6B6B] max-w-lg leading-[1.75]`}
          >
            The ancient port of Muziris was where the world's most precious spices began their journey. We continue that legacy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10"
          >
            {user ? (
              <MagneticButton href="/member">
                Access the Guild
              </MagneticButton>
            ) : (
              <MagneticButton href="#waitlist">
                Join the Guild
              </MagneticButton>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ y: imageY }}
          className="relative w-full aspect-[3/4] lg:aspect-[4/5]"
        >
          <div className="absolute inset-6 lg:inset-10">
            <Image
              src="/preview.png"
              alt="Artisanal spices from Kerala"
              fill
              className="object-cover grayscale-20 contrast-[1.1] sepia-10"
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
          </div>
          <div className="absolute inset-0 border border-[#C5A059]/20" />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className={`${sans.className} text-xs tracking-[0.2em] uppercase text-[#6B6B6B]`}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[#C5A059] to-transparent"
        />
      </motion.div>
    </section>
  );
}

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    ref.current!.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={{ scale: 0.98 }}
      className={`${sans.className} inline-flex items-center gap-3 px-8 py-4 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-[0.15em] uppercase transition-colors duration-300 hover:bg-[#1A1A1A] hover:text-[#F0EFEA]`}
      style={{ transition: "transform 0.2s ease-out, background-color 0.3s, color 0.3s" }}
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </motion.a>
  );
}
