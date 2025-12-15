"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Guest, CreateRsvpInput, CreateFamilyRsvpInput } from "./schemas";

const API_BASE = "/api";

// Type for search results with family members
export type GuestWithFamily = Guest & {
  familyMembers?: Guest[];
};

// Search guests by name, email, or phone (partial text matching)
export function useSearchGuests(query: string) {
  return useQuery<GuestWithFamily[]>({
    queryKey: ["guests", "search", query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }
      const response = await fetch(
        `${API_BASE}/guests/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!response.ok) {
        throw new Error("Failed to search guests");
      }
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create RSVP
export function useCreateRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRsvpInput) => {
      const response = await fetch(`${API_BASE}/guests/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit RSVP");
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate guests queries to refetch
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Create Family RSVP
export function useCreateFamilyRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFamilyRsvpInput) => {
      const response = await fetch(`${API_BASE}/guests/rsvp/family`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit family RSVP");
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate guests queries to refetch
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Get all guests (admin only)
export function useGetAllGuests() {
  return useQuery<Guest[]>({
    queryKey: ["guests", "all"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/guests`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch guests");
      }
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });
}

// Bulk Create Guests
export function useBulkCreateGuests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: import("./schemas").BulkCreateGuestsInput) => {
      const response = await fetch(`${API_BASE}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Update Guest Status
export function useUpdateGuestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: import("./schemas").UpdateGuestStatusInput) => {
      const response = await fetch(`${API_BASE}/guests/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Create Single Guest
export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: import("./schemas").CreateGuestInput) => {
      const response = await fetch(`${API_BASE}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Delete Guest
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/guests/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

// Update Guest
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: import("./schemas").UpdateGuestInput) => {
      const { id, ...updateData } = data;
      const response = await fetch(`${API_BASE}/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updateData }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}
