"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fff5f7]/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center text-[#5a2e2e]">
      <Link
        href="/"
        className="text-2xl font-serif tracking-widest cursor-pointer"
      >
        G&R
      </Link>

      <div className="hidden md:flex gap-8 font-light uppercase tracking-wide text-sm items-center">
        <Link
          href="/#wedding"
          className="hover:text-[#b05d5d] transition flex items-center"
        >
          The Wedding
        </Link>
        <Link
          href="/story"
          className="hover:text-[#b05d5d] transition flex items-center"
        >
          Our Story
        </Link>
        <Link
          href="/gifts"
          className="hover:text-[#b05d5d] transition flex items-center"
        >
          Gifts
        </Link>
        <Link
          href="/rsvp"
          className="bg-[#8b4545] text-white px-6 py-2 rounded-full hover:bg-[#6d3636] transition flex items-center"
        >
          RSVP
        </Link>
      </div>

      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-[#fff5f7] shadow-lg flex flex-col items-center gap-6 py-8 md:hidden font-light uppercase tracking-wide text-sm"
          >
            <Link
              href="/#wedding"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#b05d5d] transition"
            >
              The Wedding
            </Link>
            <Link
              href="/story"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#b05d5d] transition"
            >
              Our Story
            </Link>
            <Link
              href="/gifts"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#b05d5d] transition"
            >
              Gifts
            </Link>
            <Link
              href="/rsvp"
              onClick={() => setIsOpen(false)}
              className="bg-[#8b4545] text-white px-6 py-2 rounded-full"
            >
              RSVP
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
