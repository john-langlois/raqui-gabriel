"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, Calendar, Church } from "lucide-react";
import { LocationCard } from "./LocationCard";

export const WeddingDetails = () => {
  return (
    <section
      id="wedding"
      className="py-24 lg:py-32 bg-[#fff5f7] relative overflow-hidden"
    >
      {/* Delicate background florals/elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-gradient-to-br from-[#ffe4e6] to-transparent rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#ffe4e6] to-transparent rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 lg:mb-32"
        >
          <span className="text-[#8b4545] uppercase tracking-[0.3em] text-xs font-semibold mb-3 block">
            Join us on
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-[#5a2e2e] mb-6">
            The Big Day
          </h2>
          <p className="text-gray-500 italic font-serif text-xl">
            Saturday, April 18th, 2026
          </p>
        </motion.div>

        <div className="space-y-24 lg:space-y-32">
          <LocationCard
            title="Ceremony"
            time="14:30"
            location="Pingstkyrkan Mölndal"
            description="We invite you to witness our vows in the beautiful sanctuary of Pingstkyrkan. The ceremony will be a celebration of love, faith, and new beginnings."
            image="/images/pingst.jpeg"
            mapLink="https://maps.google.com/?q=Pingstkyrkan+Mölndal"
            align="left"
          />

          <LocationCard
            title="Reception"
            time="17:00 (Approx)"
            location="Hills Golf Club"
            description="Following the ceremony, please join us for an evening of dinner, dancing, and celebration at the scenic Hills Golf Club. Transportation will be provided."
            image="/images/golf_club.jpg"
            mapLink="https://maps.google.com/?q=Hills+Golf+Club+Mölndal"
            align="right"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center gap-4 p-6 bg-white/50 backdrop-blur-sm border border-white rounded-2xl shadow-sm max-w-2xl mx-auto">
            <div className="p-3 bg-[#fce7f3] rounded-full text-[#8b4545]">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-[#5a2e2e] font-serif text-lg mb-1 text-center md:text-left">
                Detailed Schedule
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed text-center md:text-left">
                A more detailed timeline including transportation details and
                toast schedules will be updated here closer to the wedding date.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
