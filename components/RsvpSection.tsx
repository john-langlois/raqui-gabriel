"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Check, ArrowRight } from "lucide-react";
import { useSearchGuests, useCreateRsvp } from "@/features/guests/api/hooks";
import type { Guest } from "@/features/guests/api/schemas";

export const RsvpSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    attending: true,
  });

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchGuests(searchTerm);
  const createRsvpMutation = useCreateRsvp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuest) return;

    try {
      await createRsvpMutation.mutateAsync({
        name: selectedGuest.name,
        email: formData.email,
        phone: formData.phone || undefined,
        attending: formData.attending,
      });
    } catch (error) {
      console.error("Failed to submit RSVP:", error);
    }
  };

  const status = createRsvpMutation.isPending
    ? "submitting"
    : createRsvpMutation.isSuccess
    ? "success"
    : "idle";

  if (status === "success") {
    return (
      <section id="rsvp" className="py-24 bg-[#5a2e2e] text-[#fff5f7]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#fff5f7] rounded-full flex items-center justify-center text-[#5a2e2e] mx-auto mb-8"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-4xl font-serif mb-4">Thank You!</h2>
          <p className="font-light text-lg">
            Your RSVP has been received. We can't wait to see you!
          </p>
          <button
            onClick={() => {
              createRsvpMutation.reset();
              setSelectedGuest(null);
              setSearchTerm("");
              setFormData({ email: "", phone: "", attending: true });
            }}
            className="mt-8 text-sm underline opacity-70 hover:opacity-100"
          >
            Submit another RSVP
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-24 bg-[#5a2e2e] text-[#fff5f7]">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-12">
          R.S.V.P
        </h2>

        {!selectedGuest ? (
          <div className="bg-[#fff5f7] text-[#5a2e2e] p-8 rounded-2xl shadow-xl">
            <label className="block text-sm uppercase tracking-widest mb-4 font-semibold text-[#8b4545]">
              Find your invitation
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Type your name, email, or phone..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b4545] transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm.trim().length >= 2 && (
              <div className="mt-4 bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden">
                {isSearching ? (
                  <div className="px-6 py-4 text-gray-400 text-sm">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => {
                        setSelectedGuest(guest);
                        setFormData((prev) => ({
                          ...prev,
                          email: guest.email || "",
                        }));
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-[#fdf2f8] transition flex justify-between items-center group"
                    >
                      <span>{guest.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#8b4545]" />
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-4 text-gray-400 text-sm">
                    No guests found. Try searching by name, email, or phone.
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4 text-center">
              Can't find your name? Please contact Gabriel or Raquel directly.
            </p>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#fff5f7] text-[#5a2e2e] p-8 rounded-2xl shadow-xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-[#e5c0c0] pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#8b4545]">
                  Guest
                </span>
                <h3 className="text-xl font-serif">{selectedGuest.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="text-xs underline text-gray-500 hover:text-[#8b4545]"
              >
                Change
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Will you attend?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${
                      formData.attending === true
                        ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="attending"
                      value="yes"
                      className="hidden"
                      checked={formData.attending === true}
                      onChange={() =>
                        setFormData({ ...formData, attending: true })
                      }
                    />
                    <span className="font-serif text-lg">Joyfully Accept</span>
                  </label>
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${
                      formData.attending === false
                        ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="attending"
                      value="no"
                      className="hidden"
                      checked={formData.attending === false}
                      onChange={() =>
                        setFormData({ ...formData, attending: false })
                      }
                    />
                    <span className="font-serif text-lg">
                      Regretfully Decline
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#8b4545] text-white font-bold py-4 rounded-xl hover:bg-[#6d3636] transition shadow-lg mt-4"
              >
                {status === "submitting" ? "Saving..." : "Confirm RSVP"}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
};
