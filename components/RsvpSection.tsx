"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Check, ArrowRight, Users } from "lucide-react";
import {
  useSearchGuests,
  useCreateRsvp,
  useCreateFamilyRsvp,
  type GuestWithFamily,
} from "@/features/guests/api/hooks";
import type { Guest } from "@/features/guests/api/schemas";

export const RsvpSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestWithFamily | null>(
    null
  );
  const [formData, setFormData] = useState({ email: "", phone: "" });
  const [familyRsvps, setFamilyRsvps] = useState<
    Record<
      string,
      { status: "attending" | "declined"; email: string; phone: string }
    >
  >({});

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchGuests(searchTerm);
  const createRsvpMutation = useCreateRsvp();
  const createFamilyRsvpMutation = useCreateFamilyRsvp();

  // Get all family members when a guest is selected
  const familyMembers = useMemo(() => {
    if (!selectedGuest) return [];

    // If the guest has family members in the search result, use those
    if (selectedGuest.familyMembers && selectedGuest.familyMembers.length > 0) {
      // Include the selected guest in the family list
      const allMembers = [selectedGuest, ...selectedGuest.familyMembers];
      // Remove duplicates by ID
      const uniqueMembers = Array.from(
        new Map(allMembers.map((m) => [m.id, m])).values()
      );
      return uniqueMembers;
    }

    // Check if this guest is part of a family (has familyHeadId)
    if (selectedGuest.familyHeadId) {
      // The guest is a family member, but we don't have the full family in search results
      // For now, just return the selected guest
      return [selectedGuest];
    }

    return [selectedGuest];
  }, [selectedGuest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuest) return;

    const hasFamily = familyMembers.length > 1;

    if (hasFamily) {
      // Submit family RSVP
      const rsvps = familyMembers.map((member) => {
        const memberRsvp = familyRsvps[member.id] || {
          status: "attending" as const,
          email: formData.email,
          phone: formData.phone,
        };
        return {
          guestId: member.id,
          email: memberRsvp.email || formData.email,
          phone: memberRsvp.phone || formData.phone || undefined,
          status: memberRsvp.status,
        };
      });

      try {
        await createFamilyRsvpMutation.mutateAsync({ rsvps });
      } catch (error) {
        console.error("Failed to submit family RSVP:", error);
      }
    } else {
      // Submit single RSVP
      const memberRsvp = familyRsvps[selectedGuest.id] || {
        status: "attending" as const,
        email: formData.email,
        phone: formData.phone,
      };

      try {
        await createRsvpMutation.mutateAsync({
          name: selectedGuest.name,
          email: memberRsvp.email || formData.email,
          phone: memberRsvp.phone || formData.phone || undefined,
          status: memberRsvp.status,
        });
      } catch (error) {
        console.error("Failed to submit RSVP:", error);
      }
    }
  };

  const status =
    createRsvpMutation.isPending || createFamilyRsvpMutation.isPending
      ? "submitting"
      : createRsvpMutation.isSuccess || createFamilyRsvpMutation.isSuccess
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
              createFamilyRsvpMutation.reset();
              setSelectedGuest(null);
              setSearchTerm("");
              setFormData({ email: "", phone: "" });
              setFamilyRsvps({});
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
                          phone: guest.phone || "",
                        }));
                        // Initialize family RSVPs
                        const members = guest.familyMembers || [];
                        const allMembers = [guest, ...members];
                        const initialRsvps: Record<
                          string,
                          {
                            status: "attending" | "declined";
                            email: string;
                            phone: string;
                          }
                        > = {};
                        allMembers.forEach((m) => {
                          initialRsvps[m.id] = {
                            status: (m.status === "declined"
                              ? "declined"
                              : "attending") as "attending" | "declined",
                            email: m.email || guest.email || "",
                            phone: m.phone || guest.phone || "",
                          };
                        });
                        setFamilyRsvps(initialRsvps);
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-[#fdf2f8] transition flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-2">
                        <span>{guest.name}</span>
                        {guest.familyMembers &&
                          guest.familyMembers.length > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {guest.familyMembers.length + 1} in family
                            </span>
                          )}
                      </div>
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
                  {familyMembers.length > 1 ? "Family" : "Guest"}
                </span>
                <h3 className="text-xl font-serif">
                  {familyMembers.length > 1
                    ? `${selectedGuest.name} & Family`
                    : selectedGuest.name}
                </h3>
                {familyMembers.length > 1 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {familyMembers.length}{" "}
                    {familyMembers.length === 1 ? "person" : "people"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedGuest(null);
                  setFamilyRsvps({});
                }}
                className="text-xs underline text-gray-500 hover:text-[#8b4545]"
              >
                Change
              </button>
            </div>

            <div className="space-y-6">
              {familyMembers.length > 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-4">
                      Family Contact Information
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
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
                        <label className="block text-xs font-medium text-gray-600 mb-1">
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
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-4">
                      RSVP for Each Family Member
                    </label>
                    <div className="space-y-4">
                      {familyMembers.map((member) => {
                        const memberRsvp = familyRsvps[member.id] || {
                          status: "attending" as const,
                          email: formData.email,
                          phone: formData.phone,
                        };
                        const isHead =
                          member.familyHeadId === member.id ||
                          (!member.familyHeadId &&
                            member.id === selectedGuest.id);

                        return (
                          <div
                            key={member.id}
                            className="border border-gray-200 rounded-xl p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-[#5a2e2e]">
                                  {member.name}
                                </h4>
                                <div className="flex gap-2 mt-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      member.type === "child"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {member.type === "child"
                                      ? "Child"
                                      : "Adult"}
                                  </span>
                                  {isHead && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-[#fff0f5] text-[#8b4545]">
                                      Head of Family
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <label
                                className={`cursor-pointer border-2 rounded-lg p-3 text-center transition ${
                                  memberRsvp.status === "attending"
                                    ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${member.id}`}
                                  className="hidden"
                                  checked={memberRsvp.status === "attending"}
                                  onChange={() =>
                                    setFamilyRsvps((prev) => ({
                                      ...prev,
                                      [member.id]: {
                                        ...memberRsvp,
                                        status: "attending",
                                      },
                                    }))
                                  }
                                />
                                <span className="font-serif text-sm">
                                  Accept
                                </span>
                              </label>
                              <label
                                className={`cursor-pointer border-2 rounded-lg p-3 text-center transition ${
                                  memberRsvp.status === "declined"
                                    ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${member.id}`}
                                  className="hidden"
                                  checked={memberRsvp.status === "declined"}
                                  onChange={() =>
                                    setFamilyRsvps((prev) => ({
                                      ...prev,
                                      [member.id]: {
                                        ...memberRsvp,
                                        status: "declined",
                                      },
                                    }))
                                  }
                                />
                                <span className="font-serif text-sm">
                                  Decline
                                </span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Will you attend?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${
                          (familyRsvps[selectedGuest.id]?.status ||
                            "attending") === "attending"
                            ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attending"
                          value="yes"
                          className="hidden"
                          checked={
                            (familyRsvps[selectedGuest.id]?.status ||
                              "attending") === "attending"
                          }
                          onChange={() =>
                            setFamilyRsvps((prev) => ({
                              ...prev,
                              [selectedGuest.id]: {
                                status: "attending",
                                email:
                                  prev[selectedGuest.id]?.email ||
                                  formData.email,
                                phone:
                                  prev[selectedGuest.id]?.phone ||
                                  formData.phone,
                              },
                            }))
                          }
                        />
                        <span className="font-serif text-lg">
                          Joyfully Accept
                        </span>
                      </label>
                      <label
                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${
                          familyRsvps[selectedGuest.id]?.status === "declined"
                            ? "border-[#8b4545] bg-[#fdf2f8] text-[#8b4545]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attending"
                          value="no"
                          className="hidden"
                          checked={
                            familyRsvps[selectedGuest.id]?.status === "declined"
                          }
                          onChange={() =>
                            setFamilyRsvps((prev) => ({
                              ...prev,
                              [selectedGuest.id]: {
                                status: "declined",
                                email:
                                  prev[selectedGuest.id]?.email ||
                                  formData.email,
                                phone:
                                  prev[selectedGuest.id]?.phone ||
                                  formData.phone,
                              },
                            }))
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
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFamilyRsvps((prev) => ({
                          ...prev,
                          [selectedGuest.id]: {
                            ...(prev[selectedGuest.id] || {
                              status: "attending" as const,
                              phone: formData.phone,
                            }),
                            email: e.target.value,
                          },
                        }));
                      }}
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
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setFamilyRsvps((prev) => ({
                          ...prev,
                          [selectedGuest.id]: {
                            ...(prev[selectedGuest.id] || {
                              status: "attending" as const,
                              email: formData.email,
                            }),
                            phone: e.target.value,
                          },
                        }));
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#8b4545] text-white font-bold py-4 rounded-xl hover:bg-[#6d3636] transition shadow-lg mt-4"
              >
                {status === "submitting"
                  ? "Saving..."
                  : `Confirm ${familyMembers.length > 1 ? "Family " : ""}RSVP`}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
};
