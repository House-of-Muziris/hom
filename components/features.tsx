"use client";

import { motion } from "framer-motion";
import { cinzel, manrope } from "@/lib/fonts";

const FEATURES = [
  {
    title: "Rare & Potent Spices",
    desc: "Single-origin Pepper, Cardamom, Turmeric, and more — celebrated for their aroma and complexity.",
  },
  {
    title: "Direct from Source",
    desc: "We partner directly with farmers, ensuring fair trade, traceability, and the freshest harvests.",
  },
  {
    title: "The Story in the Spice",
    desc: "Each batch carries its own tale — connecting your craft to 2,000 years of Kerala's spice history.",
  },
];

export function Features() {
  return (
    <section className="py-32 bg-[#f3f1ec] dark:bg-[#141414]">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`${cinzel.className} text-4xl text-[#705a2e] dark:text-[#c7b174] mb-16`}
        >
          What We Deliver
        </motion.h3>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {FEATURES.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="p-10 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm border border-[#eae8e3] dark:border-[#2c2c2c] hover:shadow-lg transition-all duration-300"
            >
              <h4 className={`${cinzel.className} text-2xl text-[#705a2e] dark:text-[#c7b174] mb-6`}>
                {card.title}
              </h4>
              <p className={`${manrope.className} text-gray-700 dark:text-gray-300 leading-relaxed`}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h4 className={`${cinzel.className} text-3xl text-[#705a2e] dark:text-[#c7b174] mb-8`}>
            Trusted by the World's Finest
          </h4>
          <p className={`${manrope.className} text-lg text-gray-700 dark:text-gray-300 leading-relaxed`}>
            We serve Michelin-starred chefs, specialty food distributors, and
            gourmet brands who understand that an extraordinary dish begins with
            an extraordinary ingredient.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
