"use client";

import { motion } from "framer-motion";
import { cinzel, manrope } from "@/lib/fonts";

export function Overview() {
  return (
    <section id="overview" className="relative z-10 flex flex-col items-center py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className={`${cinzel.className} text-5xl text-[#705a2e] dark:text-[#c7b174] mb-12`}>
          Where History Meets Flavor
        </h2>
        <div className={`${manrope.className} text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-6 text-left`}>
          <p>
            Once, the ancient port of Muziris was the center of the world's spice
            trade — where empires sailed for Kerala's legendary treasures. House
            of Muziris revives this legacy for today's most discerning creators.
          </p>
          <p>
            We are a direct-source exporter of Kerala's finest spices, bridging
            the fertile soils of South India with the world's premier kitchens.
            Working with multi-generational farms, we bring you spices that are
            not just commodities, but stories in a jar.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
