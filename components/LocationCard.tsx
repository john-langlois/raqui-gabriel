"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRight, LucideIcon } from "lucide-react";

interface LocationCardProps {
  title: string;
  time: string;
  location: string;
  description: string;
  image: string;
  mapLink: string;
  align?: "left" | "right";
}

export const LocationCard = ({
  title,
  time,
  location,
  description,
  image,
  mapLink,
  align = "left",
}: LocationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-24 ${
        align === "right" ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Image Side */}
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="relative group">
          {/* Decorative offset border */}
          <div
            className={`absolute top-4 ${
              align === "left" ? "-left-4" : "-right-4"
            } w-full h-full border border-[#dcb3b3] rounded-t-[10rem] rounded-b-lg hidden md:block transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1`}
          ></div>

          <div className="relative w-[300px] h-[400px] lg:w-[350px] lg:h-[450px] overflow-hidden shadow-xl rounded-t-[10rem] rounded-b-lg bg-white">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#5a2e2e]/10 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div
        className={`w-full md:w-1/2 text-center ${
          align === "left" ? "md:text-left" : "md:text-right"
        }`}
      >
        <h3 className="text-4xl lg:text-5xl font-serif text-[#5a2e2e] mb-2">
          {title}
        </h3>

        <div
          className={`h-1 w-20 bg-[#dcb3b3] mb-6 rounded-full mx-auto ${
            align === "left" ? "md:mx-0" : "md:ml-auto md:mr-0"
          }`}
        ></div>

        <div className="space-y-4 mb-8">
          <div
            className={`flex items-center gap-3 text-[#8b4545] justify-center ${
              align === "left" ? "md:justify-start" : "md:justify-end"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-xl font-medium tracking-wide">{time}</span>
          </div>

          <div
            className={`flex items-center gap-3 text-gray-600 justify-center ${
              align === "left" ? "md:justify-start" : "md:justify-end"
            }`}
          >
            <MapPin className="w-5 h-5 text-[#8b4545]" />
            <span className="text-lg">{location}</span>
          </div>
        </div>

        <p className="text-gray-500 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
          {description}
        </p>

        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[#8b4545] font-semibold uppercase tracking-widest text-xs border-b border-[#8b4545] pb-1 hover:text-[#5a2e2e] hover:border-[#5a2e2e] transition-all group"
        >
          View on Map
          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};
