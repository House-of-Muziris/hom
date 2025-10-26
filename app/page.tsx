"use client";

import Image from "next/image";
import { Cinzel, Manrope } from "next/font/google";
import { motion } from "framer-motion";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600"] });

export default function Home() {
  return (
    <div className="bg-[#f8f6f3] dark:bg-[#0a0a0a] text-[#2b2b2b] dark:text-[#e5e3df]">
      {/* ---------------- HERO ---------------- */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-[#f8f6f3]/80 dark:from-[#0a0a0a]/80 to-transparent" />

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Text Content */}
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

          {/* Image Preview */}
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

      {/* ---------------- OVERVIEW ---------------- */}
      <section
        id="overview"
        className="relative z-10 flex flex-col items-center py-32 px-6"
      >
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

      {/* ---------------- WHAT WE DELIVER & CLIENTELE ---------------- */}
      <section className="py-32 bg-[#f3f1ec] dark:bg-[#141414]">
        <div className="max-w-7xl mx-auto px-8">
          {/* What We Deliver */}
          <div className="text-center">
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
              {[
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
              ].map((card, i) => (
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

            {/* Trusted By Section */}
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
        </div>
      </section>

      {/* ---------------- CONTACT FORM ---------------- */}
      <section className="py-32 px-6 bg-[#f8f6f3] dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h4 className={`${cinzel.className} text-4xl text-[#705a2e] dark:text-[#c7b174] mb-6`}>
              Connect With Legacy
            </h4>
            <p className={`${manrope.className} text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto`}>
              Begin your journey with spices that carry centuries of heritage and flavor
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const data = new FormData(form);
              const payload = {
                name: String(data.get("name") || ""),
                country: String(data.get("country") || ""),
                phone: String(data.get("phone") || ""),
                email: String(data.get("email") || ""),
                message: String(data.get("message") || ""),
              };
              console.log("Contact form submitted:", payload);
              alert("Thank you! Your message has been received.");
              form.reset();
            }}
            className="bg-white dark:bg-[#1a1a1a] p-12 rounded-3xl shadow-sm border border-[#eae8e3] dark:border-[#2c2c2c]"
          >
            <div className="grid grid-cols-1 gap-8">
              {/* Name and Country Code in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="flex flex-col">
                  <span className={`${manrope.className} text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3`}>
                    Full Name *
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    className="px-6 py-4 rounded-xl border border-gray-200 dark:border-[#2c2c2c] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:border-[#705a2e] dark:focus:border-[#c7b174]"
                    placeholder="Your full name"
                  />
                </label>

                <label className="flex flex-col">
                  <span className={`${manrope.className} text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3`}>
                    Country Code *
                  </span>
                  <select
                    name="country"
                    required
                    className="px-6 py-4 rounded-xl border border-gray-200 dark:border-[#2c2c2c] bg-transparent outline-none text-gray-800 dark:text-gray-100 transition-colors focus:border-[#705a2e] dark:focus:border-[#c7b174]"
                    defaultValue="+91"
                  >
                    <option value="+1">United States (+1)</option>
                    <option value="+44">United Kingdom (+44)</option>
                    <option value="+91">India (+91)</option>
                    <option value="+61">Australia (+61)</option>
                    <option value="+49">Germany (+49)</option>
                    <option value="+33">France (+33)</option>
                    <option value="+82">South Korea (+82)</option>
                    <option value="+86">China (+86)</option>
                    <option value="+971">UAE (+971)</option>
                  </select>
                </label>
              </div>

              {/* Email and Phone in next row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="flex flex-col">
                  <span className={`${manrope.className} text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3`}>
                    Email Address *
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="px-6 py-4 rounded-xl border border-gray-200 dark:border-[#2c2c2c] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:border-[#705a2e] dark:focus:border-[#c7b174]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="flex flex-col">
                  <span className={`${manrope.className} text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3`}>
                    Phone Number *
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="px-6 py-4 rounded-xl border border-gray-200 dark:border-[#2c2c2c] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:border-[#705a2e] dark:focus:border-[#c7b174]"
                    placeholder="123 456 7890"
                  />
                </label>
              </div>

              {/* Message - full width */}
              <label className="flex flex-col">
                <span className={`${manrope.className} text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3`}>
                  Your Message *
                </span>
                <textarea
                  name="message"
                  rows={6}
                  required
                  className="px-6 py-4 rounded-xl border border-gray-200 dark:border-[#2c2c2c] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors focus:border-[#705a2e] dark:focus:border-[#c7b174] resize-none"
                  placeholder="Tell us about your spice requirements, partnership interests, or any specific inquiries..."
                />
              </label>
            </div>

            <div className="mt-12 text-center">
              <button
                type="submit"
                className="inline-block rounded-full bg-[#705a2e] dark:bg-[#c7b174] text-white dark:text-black px-12 py-4 hover:opacity-90 transition-all duration-300 font-semibold text-lg min-w-[200px]"
              >
                Send Message
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="text-center py-12 text-sm text-gray-500 dark:text-gray-400 border-t border-[#eae8e3] dark:border-[#2c2c2c]">
        <div className="max-w-6xl mx-auto px-8">
          <p className={`${cinzel.className} text-lg text-[#705a2e] dark:text-[#c7b174] mb-4`}>
            House of Muziris
          </p>
          <p>© {new Date().getFullYear()} House of Muziris. All rights reserved.</p>
          <p className="mt-2 text-xs opacity-70">
            Preserving Kerala's spice legacy for generations to come
          </p>
        </div>
      </footer>
    </div>
  );
}