"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { fadeUp, stagger } from "@/lib/theme";
import { submitMembershipAction } from "@/app/actions/membership";
import { trackMembershipRequest } from "@/lib/analytics";

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}

function FloatingField({ label, name, type = "text", required = true }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = focused || value.length > 0;

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <motion.label
        className={`${sans.className} absolute left-0 pointer-events-none text-[#6B6B6B] transition-all duration-300 origin-left`}
        animate={{
          y: isActive ? -24 : 0,
          scale: isActive ? 0.75 : 1,
          color: focused ? "#C5A059" : "#6B6B6B",
        }}
      >
        {label}
      </motion.label>
      <input
        ref={inputRef}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${sans.className} w-full bg-transparent border-b border-[#E5E3DE] pb-3 pt-1 text-[#1A1A1A] outline-none transition-colors focus:border-[#C5A059]`}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-[#C5A059]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: focused ? 1 : 0 }}
        style={{ originX: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function FloatingTextarea({ label, name, required = false }: Omit<FieldProps, "type">) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isActive = focused || value.length > 0;

  return (
    <div className="relative" onClick={() => textareaRef.current?.focus()}>
      <motion.label
        className={`${sans.className} absolute left-0 pointer-events-none text-[#6B6B6B] transition-all duration-300 origin-left`}
        animate={{
          y: isActive ? -24 : 0,
          scale: isActive ? 0.75 : 1,
          color: focused ? "#C5A059" : "#6B6B6B",
        }}
      >
        {label}
      </motion.label>
      <textarea
        ref={textareaRef}
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={4}
        className={`${sans.className} w-full bg-transparent border-b border-[#E5E3DE] pb-3 pt-1 text-[#1A1A1A] outline-none transition-colors focus:border-[#C5A059] resize-none`}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-[#C5A059]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: focused ? 1 : 0 }}
        style={{ originX: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

type MemberType = "private" | "trade";

export function Waitlist() {
  const [memberType, setMemberType] = useState<MemberType>("private");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const form = e.currentTarget;
    const data = new FormData(form);
    
    const memberData: any = {
      memberType,
      name: data.get("name") as string,
      email: data.get("email") as string,
    };

    if (memberType === "private") {
      const phone = data.get("phone") as string;
      const message = data.get("message") as string;
      if (phone) memberData.phone = phone;
      if (message) memberData.message = message;
    } else {
      memberData.company = data.get("company") as string;
      memberData.role = data.get("role") as string;
      memberData.businessType = data.get("businessType") as string;
      memberData.monthlyVolume = data.get("monthlyVolume") as string;
    }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout. Please try again.")), 10000)
      );
      
      const result = await Promise.race([
        submitMembershipAction(memberData),
        timeoutPromise
      ]) as any;

      setLoading(false);
      
      if (result.success) {
        trackMembershipRequest(memberData.email, memberData.company || "Private Client");
        setSubmitted(true);
        form.reset();
      } else {
        setError(result.error || "Failed to submit request");
      }
    } catch (error: any) {
      setLoading(false);
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <section id="waitlist" className="min-h-screen flex items-center bg-[#F0EFEA] py-32">
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col justify-center"
        >
          <motion.span
            variants={fadeUp}
            className={`${sans.className} text-sm tracking-[0.3em] uppercase text-[#C5A059] mb-6`}
          >
            Exclusive Access
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className={`${serif.className} text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-[#1A1A1A]`}
          >
            Apply for
            <br />
            <em>Membership</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className={`${sans.className} mt-8 text-lg text-[#6B6B6B] max-w-md leading-relaxed font-light`}
          >
            We supply the world's finest establishments. Join our guild of discerning chefs, sommeliers, and culinary artisans.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-[#E5E3DE] border-2 border-[#F0EFEA]" />
              ))}
            </div>
            <span className={`${sans.className} text-sm text-[#6B6B6B]`}>
              Join 2,400+ culinary professionals
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-10 lg:p-14 border border-[#E5E3DE] relative"
        >
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#C5A059] -translate-x-3 -translate-y-3" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#C5A059] translate-x-3 translate-y-3" />

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Toggle Tabs */}
                <div className="flex gap-2 mb-8 p-1 bg-[#F0EFEA] border border-[#E5E3DE]">
                  <button
                    type="button"
                    onClick={() => setMemberType("private")}
                    className={`${sans.className} flex-1 py-3 text-xs tracking-wider uppercase transition-all ${
                      memberType === "private"
                        ? "bg-white text-[#1A1A1A] border border-[#E5E3DE]"
                        : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                    }`}
                  >
                    Private Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberType("trade")}
                    className={`${sans.className} flex-1 py-3 text-xs tracking-wider uppercase transition-all ${
                      memberType === "trade"
                        ? "bg-white text-[#1A1A1A] border border-[#E5E3DE]"
                        : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                    }`}
                  >
                    Trade Partners
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {memberType === "private" ? (
                    <>
                      <FloatingField label="Full Name" name="name" />
                      <FloatingField label="Email Address" name="email" type="email" />
                      <FloatingField label="Phone Number" name="phone" type="tel" required={false} />
                      <FloatingTextarea label="What brings you to Muziris?" name="message" required={false} />
                    </>
                  ) : (
                    <>
                      <FloatingField label="Company / Establishment Name" name="company" />
                      <FloatingField label="Contact Person Name" name="name" />
                      <FloatingField label="Business Email" name="email" type="email" />
                      
                      <div className="relative">
                        <label className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-3`}>
                          Business Type
                        </label>
                        <select
                          name="businessType"
                          required
                          className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-white text-[#1A1A1A] outline-none focus:border-[#C5A059] transition-colors appearance-none cursor-pointer`}
                        >
                          <option value="">Select type...</option>
                          <option value="restaurant">Restaurant / Cafe</option>
                          <option value="hotel">Hotel / Hospitality</option>
                          <option value="corporate">Corporate Gifting</option>
                          <option value="retailer">Retailer</option>
                        </select>
                        <div className="pointer-events-none absolute right-4 top-[42px] text-[#6B6B6B]">▼</div>
                      </div>

                      <div className="relative">
                        <label className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-3`}>
                          Estimated Monthly Volume
                        </label>
                        <select
                          name="monthlyVolume"
                          required
                          className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-white text-[#1A1A1A] outline-none focus:border-[#C5A059] transition-colors appearance-none cursor-pointer`}
                        >
                          <option value="">Select volume...</option>
                          <option value="<1kg">{"< 1 kg (Sampler)"}</option>
                          <option value="1-10kg">1 - 10 kg</option>
                          <option value="10+kg">10+ kg (Bulk)</option>
                        </select>
                        <div className="pointer-events-none absolute right-4 top-[42px] text-[#6B6B6B]">▼</div>
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#C5A059] disabled:opacity-60`}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Processing...
                      </motion.span>
                    ) : (
                      "Request Membership"
                    )}
                  </motion.button>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${sans.className} text-sm text-red-600 text-center`}
                    >
                      {error}
                    </motion.p>
                  )}

                  <p className={`${sans.className} text-xs text-center text-[#6B6B6B]`}>
                    By applying, you agree to our terms of service and privacy policy.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-16 h-16 rounded-full bg-[#C5A059]/10 flex items-center justify-center mb-6"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L19 7" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-3`}>
                  Application Received
                </h3>
                <p className={`${sans.className} text-[#6B6B6B] max-w-xs`}>
                  We'll review your application and reach out within 48 hours.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
