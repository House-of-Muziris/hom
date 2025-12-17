"use client";

import { motion } from "framer-motion";
import { cinzel, manrope } from "@/lib/fonts";

export function ContactForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    console.log("Contact form submitted:", payload);
    alert("Thank you! Your message has been received.");
    form.reset();
  };

  return (
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
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1a1a] p-12 rounded-3xl shadow-sm border border-[#eae8e3] dark:border-[#2c2c2c]"
        >
          <div className="grid grid-cols-1 gap-8">
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
  );
}
