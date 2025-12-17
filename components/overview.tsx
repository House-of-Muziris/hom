"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { serif, sans } from "@/lib/fonts";
import { fadeUp, stagger } from "@/lib/theme";

export function Overview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="overview" className="relative py-32 lg:py-48 bg-[#EAE8E3] overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-[#C5A059] to-transparent" />

      <div className="max-w-6xl mx-auto px-8 lg:px-16 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span
            variants={fadeUp}
            className={`${sans.className} text-sm tracking-[0.3em] uppercase text-[#C5A059] mb-6 block`}
          >
            Our Heritage
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className={`${serif.className} text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-[#1A1A1A] mb-8`}
          >
            Where History
            <br />
            <em>Meets Flavor</em>
          </motion.h2>
          <motion.div variants={fadeUp} className={`${sans.className} text-lg text-[#6B6B6B] space-y-6 leading-relaxed font-light`}>
            <p>
              Once, the ancient port of Muziris was the center of the world's spice
              trade — where empires sailed for Kerala's legendary treasures.
            </p>
            <p>
              We are a direct-source exporter of Kerala's finest spices, bridging
              the fertile soils of South India with the world's premier kitchens.
            </p>
          </motion.div>
        </motion.div>

        <motion.div style={{ y }} className="relative aspect-3/4 bg-[#1A1A1A]/5">
          <div className="absolute inset-6 border border-[#C5A059]/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${serif.className} text-6xl text-[#C5A059]/20 italic`}>M</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
