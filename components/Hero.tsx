"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="h-screen relative flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/main.JPG"
          alt="Gabriel & Raquel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center text-[#fff5f7] px-4"
      >
        <p className="text-xl md:text-2xl font-serif italic mb-4 opacity-90">
          We invite you to celebrate our wedding
        </p>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl mb-8 leading-tight">
          Gabriel{" "}
          <span className="font-light italic text-4xl md:text-7xl align-middle mx-2">
            &
          </span>{" "}
          Raquel
        </h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-lg md:text-xl font-light tracking-wide uppercase">
          <div className="flex flex-col items-center">
            <span className="font-serif italic capitalize text-2xl mb-1">When</span>
            <span>April 18, 2026</span>
          </div>
          <div className="hidden md:block w-px h-12 bg-[#fff5f7]/50" />
          <div className="flex flex-col items-center">
            <span className="font-serif italic capitalize text-2xl mb-1">Where</span>
            <span>Pingstkyrkan, Mölndal</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 z-10 flex flex-col items-center gap-3 text-[#fff5f7] cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={() =>
          document
            .getElementById("wedding")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span className="text-xs uppercase tracking-widest">View details</span>
        <ArrowRight className="rotate-90 w-5 h-5" />
      </motion.div>
    </section>
  );
};
