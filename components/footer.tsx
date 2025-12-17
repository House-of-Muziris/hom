"use client";

import { cinzel } from "@/lib/fonts";

export function Footer() {
  return (
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
  );
}
