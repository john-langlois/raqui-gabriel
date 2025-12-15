"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Story = {
  id: string;
  imageUrl: string;
  description: string | null;
  takenAt: string | Date;
};

interface StoryGalleryProps {
  initialStories: Story[];
}

export function StoryGallery({ initialStories }: StoryGalleryProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Date formatter
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="bg-white min-h-screen py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-center text-[#5a2e2e] mb-16">
          Our Journey
        </h1>

        {initialStories.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            Stories appearing soon...
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialStories.map((story) => (
              <div
                key={story.id}
                className="break-inside-avoid relative group cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={story.imageUrl}
                    alt={story.description || "Story image"}
                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                    <p className="text-white text-sm font-medium">
                      {formatDate(story.takenAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selectedStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedStory(null)}
            >
              <div
                className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedStory(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Image Section */}
                <div className="flex-1 bg-black flex items-center justify-center p-2">
                  <img
                    src={selectedStory.imageUrl}
                    alt="Story"
                    className="max-h-[50vh] md:max-h-full w-auto object-contain"
                  />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-[400px] p-8 flex flex-col justify-center bg-white">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-serif text-[#5a2e2e] mb-2">
                        {formatDate(selectedStory.takenAt)}
                      </h3>
                      <div className="w-16 h-1 bg-[#8b4545]" />
                    </div>

                    {selectedStory.description && (
                      <p className="text-gray-600 leading-relaxed text-lg font-light">
                        {selectedStory.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
