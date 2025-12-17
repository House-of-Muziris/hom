"use client";

import { motion } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { fadeUp, stagger } from "@/lib/theme";

const FEATURES = [
  { num: "01", title: "Single Origin", desc: "Pepper, Cardamom, Turmeric — each traced to its exact terroir." },
  { num: "02", title: "Direct Trade", desc: "Partnered with multi-generational farms across Kerala." },
  { num: "03", title: "Living History", desc: "2,000 years of spice heritage in every shipment." },
];

export function Features() {
  return (
    <section className="py-32 lg:py-48 bg-[#1A1A1A] text-[#F0EFEA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.span
            variants={fadeUp}
            className={`${sans.className} text-sm tracking-[0.3em] uppercase text-[#C5A059] mb-6 block`}
          >
            The Collection
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className={`${serif.className} text-4xl md:text-5xl lg:text-6xl leading-[1.1]`}
          >
            What We <em>Deliver</em>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-[#2D2D2D]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="bg-[#1A1A1A] p-10 lg:p-14 group hover:bg-[#222] transition-colors duration-500"
            >
              <span className={`${sans.className} text-xs tracking-[0.2em] text-[#C5A059]`}>{f.num}</span>
              <h3 className={`${serif.className} text-2xl lg:text-3xl mt-6 mb-4 group-hover:text-[#C5A059] transition-colors`}>
                {f.title}
              </h3>
              <p className={`${sans.className} text-[#6B6B6B] leading-relaxed font-light`}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 text-center"
        >
          <p className={`${sans.className} text-sm tracking-[0.2em] uppercase text-[#6B6B6B] mb-6`}>
            Trusted by the world's finest
          </p>
          <div className="flex justify-center items-center gap-12 opacity-40">
            {["NOMA", "ELEVEN MADISON", "THE LEDBURY", "GAGGAN"].map((n) => (
              <span key={n} className={`${sans.className} text-sm tracking-[0.15em]`}>{n}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
