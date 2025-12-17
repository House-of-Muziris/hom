"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cinzel, manrope } from "@/lib/fonts";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-t from-[#f8f6f3]/80 dark:from-[#0a0a0a]/80 to-transparent" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-start text-left flex-1"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className={`${cinzel.className} text-5xl md:text-7xl lg:text-8xl text-[#705a2e] dark:text-[#c7b174] leading-tight`}
          >
            House of Muziris
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className={`${manrope.className} mt-8 max-w-2xl text-gray-700 dark:text-gray-300 text-xl leading-relaxed`}
          >
            Experience Spices That Once Moved Empires.
          </motion.p>
          <motion.a
            href="#overview"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-12 inline-block rounded-full border-2 border-[#705a2e] px-10 py-4 text-[#705a2e] dark:border-[#c7b174] dark:text-[#c7b174] hover:bg-[#705a2e] hover:text-white dark:hover:bg-[#c7b174] dark:hover:text-black transition-all duration-300 font-semibold text-lg"
          >
            Discover More
          </motion.a>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="shrink-0 mt-12 lg:mt-0"
        >
          <div className="w-full max-w-[500px] lg:w-[500px] lg:h-[500px] relative">
            <Image
              src="/preview.png"
              alt="House of Muziris Spices Preview"
              width={500}
              height={500}
              className="rounded-3xl object-cover shadow-2xl"
              priority
            />
            <div className="absolute inset-0 rounded-3xl border-2 border-[#705a2e]/10 dark:border-[#c7b174]/10 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
