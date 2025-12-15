"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  useGetAllGuests,
  useBulkCreateGuests,
  useUpdateGuestStatus,
  useCreateGuest,
  useDeleteGuest,
  useUpdateGuest,
} from "@/features/guests/api/hooks";
import { useRouter } from "next/navigation";
import {
  Search,
  LogOut,
  Check,
  X,
  Upload,
  Users,
  Baby,
  Hourglass,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";

export function AdminPanel() {
  const {
    data: guests = [],
    isLoading: isLoadingGuests,
    error: guestsError,
  } = useGetAllGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"guests" | "stories">("guests");
  const router = useRouter();

  // Stories State
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", takenAt: "" });

  // Guest Management State
  const [guestViewMode, setGuestViewMode] = useState<"main" | "waitlist">(
    "main"
  );
  const [selectedWaitlistIds, setSelectedWaitlistIds] = useState<Set<string>>(
    new Set()
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importType, setImportType] = useState<"adult" | "child">("adult");

  // Add Guest Modal State
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestType, setNewGuestType] = useState<"adult" | "child">("adult");
  const [newGuestWaitlist, setNewGuestWaitlist] = useState(false);

  // Edit Guest Modal State
  const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [editGuestForm, setEditGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "pending" as "pending" | "attending" | "declined",
    type: "adult" as "adult" | "child",
    isOnWaitlist: false,
  });

  const bulkCreateMutation = useBulkCreateGuests();
  const updateStatusMutation = useUpdateGuestStatus();
  const createGuestMutation = useCreateGuest();
  const deleteGuestMutation = useDeleteGuest();
  const updateGuestMutation = useUpdateGuest();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  // Fetch stories when tab changes to stories
  React.useEffect(() => {
    if (activeTab === "stories") {
      loadStories();
    }
  }, [activeTab]);

  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      const { getStories } = await import("@/features/stories/api/stories");
      const result = await getStories();
      if (result.success && result.data) {
        setStories(result.data);
      }
    } catch (err) {
      console.error("Failed to load stories", err);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const handeUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress("Starting upload...");

    try {
      const formData = new FormData(e.currentTarget);
      const files = fileInputRef.current?.files;
      const description = formData.get("description") as string;
      const takenAt = formData.get("takenAt") as string;

      if (!files || files.length === 0) {
        alert("Please select files");
        return;
      }

      // Import client-side upload
      const { upload } = await import("@vercel/blob/client");
      const { createStoryRecord } = await import(
        "@/features/stories/api/stories"
      );

      let successCount = 0;
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${total}...`);

        try {
          // 1. Upload to Blob
          const newBlob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload/stories",
          });

          // 2. Save metadata to DB
          await createStoryRecord(newBlob.url, description, takenAt);
          successCount++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}`, err);
        }
      }

      setUploadProgress("Done!");
      // Reset form
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFiles(null);
      (e.target as HTMLFormElement).reset();
      await loadStories();

      if (successCount < total) {
        alert(`Uploaded ${successCount}/${total} photos. Some failed.`);
      }
    } catch (err) {
      console.error("Upload process error", err);
      alert("Error uploading stories. Check console.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleDeleteStory = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const { deleteStory } = await import("@/features/stories/api/stories");
      await deleteStory(id, imageUrl);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete story");
    }
  };

  const handleEditClick = (story: any) => {
    setEditingStoryId(story.id);
    // Format date for input type="date" (YYYY-MM-DD)
    const dateStr = story.takenAt
      ? new Date(story.takenAt).toISOString().split("T")[0]
      : "";
    setEditForm({
      description: story.description || "",
      takenAt: dateStr,
    });
  };

  const handleCancelEdit = () => {
    setEditingStoryId(null);
    setEditForm({ description: "", takenAt: "" });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { updateStory } = await import("@/features/stories/api/stories");
      const result = await updateStory(
        id,
        editForm.description,
        editForm.takenAt
      );

      if (result.success) {
        setStories((prev) =>
          prev.map((story) => {
            if (story.id === id) {
              return { ...story, ...editForm };
            }
            return story;
          })
        );
        setEditingStoryId(null);
      } else {
        alert("Failed to update story");
      }
    } catch (err) {
      console.error("Error updating story", err);
      alert("Failed to update story");
    }
  };

  // Guests Filter
  const filteredGuests = useMemo(() => {
    let result = guests;

    // Filter by View Mode (Main list vs Waitlist)
    if (guestViewMode === "main") {
      result = result.filter((g) => !g.isOnWaitlist);
    } else {
      result = result.filter((g) => g.isOnWaitlist);
    }

    if (!searchTerm) return result;
    const term = searchTerm.toLowerCase();
    return result.filter((guest) => guest.name.toLowerCase().includes(term));
  }, [guests, searchTerm, guestViewMode]);

  // Stats Calculations
  const stats = useMemo(() => {
    const mainList = guests.filter((g) => !g.isOnWaitlist);
    return {
      totalMain: mainList.length,
      adults: mainList.filter((g) => g.type === "adult").length,
      children: mainList.filter((g) => g.type === "child").length,
      waitlist: guests.filter((g) => g.isOnWaitlist).length,
      pending: mainList.filter((g) => g.status === "pending").length,
      attending: mainList.filter((g) => g.status === "attending").length,
      declined: mainList.filter((g) => g.status === "declined").length,
    };
  }, [guests]);

  const handleBulkImport = async () => {
    if (!importData.trim()) return;

    // Simple format: one name per line
    const names = importData
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedGuests = names.map((name) => ({
      name,
      type: importType,
      isOnWaitlist: false,
    }));

    try {
      await bulkCreateMutation.mutateAsync({ guests: parsedGuests });
      setIsImportModalOpen(false);
      setImportData("");
      alert(`Successfully imported ${parsedGuests.length} guests.`);
    } catch (err) {
      alert("Failed to import guests. Check format and try again.");
    }
  };

  const handleMoveToMain = async () => {
    if (selectedWaitlistIds.size === 0) return;

    try {
      await updateStatusMutation.mutateAsync({
        guestIds: Array.from(selectedWaitlistIds),
        isOnWaitlist: false,
      });
      setSelectedWaitlistIds(new Set());
    } catch (err) {
      alert("Failed to move guests.");
    }
  };

  const toggleWaitlistSelection = (id: string) => {
    const newSet = new Set(selectedWaitlistIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedWaitlistIds(newSet);
  };

  const handleAddGuest = async () => {
    if (!newGuestName.trim()) return;

    try {
      await createGuestMutation.mutateAsync({
        name: newGuestName.trim(),
        type: newGuestType,
        isOnWaitlist: newGuestWaitlist,
      });
      setNewGuestName("");
      setNewGuestWaitlist(false);
      setIsAddGuestModalOpen(false);
    } catch (err) {
      alert("Failed to add guest.");
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

    try {
      await deleteGuestMutation.mutateAsync(id);
    } catch (err) {
      alert("Failed to delete guest.");
    }
  };

  const handleEditGuest = (guest: any) => {
    setEditingGuest(guest);
    setEditGuestForm({
      name: guest.name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      status: guest.status || "pending",
      type: guest.type || "adult",
      isOnWaitlist: guest.isOnWaitlist || false,
    });
    setIsEditGuestModalOpen(true);
  };

  const handleSaveEditGuest = async () => {
    if (!editingGuest || !editGuestForm.name.trim()) return;

    try {
      await updateGuestMutation.mutateAsync({
        id: editingGuest.id,
        name: editGuestForm.name.trim(),
        email: editGuestForm.email.trim() || null,
        phone: editGuestForm.phone.trim() || null,
        status: editGuestForm.status,
        type: editGuestForm.type,
        isOnWaitlist: editGuestForm.isOnWaitlist,
      });
      setIsEditGuestModalOpen(false);
      setEditingGuest(null);
    } catch (err) {
      alert("Failed to update guest.");
    }
  };

  const attendingCount = filteredGuests.filter(
    (g) => g.status === "attending"
  ).length;
  const pendingCount = filteredGuests.filter(
    (g) => g.status === "pending"
  ).length;
  const declinedCount = filteredGuests.filter(
    (g) => g.status === "declined"
  ).length;

  if (isLoadingGuests) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f7]">
        <div className="text-[#5a2e2e] text-xl">Loading...</div>
      </div>
    );
  }

  if (guestsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff5f7]">
        <div className="text-red-600 text-xl">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-serif text-[#5a2e2e]">
                Admin Panel
              </h1>
              <p className="text-[#8b4545] opacity-80">
                Manage your guest list and wedding details
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab("guests")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "guests"
                    ? "bg-[#8b4545] text-white"
                    : "bg-white text-[#5a2e2e] hover:bg-gray-50"
                }`}
              >
                Guest List
              </button>
              <button
                onClick={() => setActiveTab("stories")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "stories"
                    ? "bg-[#8b4545] text-white"
                    : "bg-white text-[#5a2e2e] hover:bg-gray-50"
                }`}
              >
                Our Story
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-[#8b4545] px-4 py-2 rounded-lg hover:bg-gray-50 transition border border-[#8b4545]"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {activeTab === "guests" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#fff0f5] rounded-lg text-[#8b4545]">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Adults
                  </span>
                </div>
                <div className="text-3xl font-serif text-[#5a2e2e]">
                  {stats.adults}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#fff0f5] rounded-lg text-[#8b4545]">
                    <Baby className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Children
                  </span>
                </div>
                <div className="text-3xl font-serif text-[#5a2e2e]">
                  {stats.children}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                    <Hourglass className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Pending
                  </span>
                </div>
                <div className="text-3xl font-serif text-yellow-600">
                  {stats.pending}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Attending
                  </span>
                </div>
                <div className="text-3xl font-serif text-green-600">
                  {stats.attending}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 rounded-lg text-red-500">
                    <X className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Declined
                  </span>
                </div>
                <div className="text-3xl font-serif text-red-500">
                  {stats.declined}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                    <Hourglass className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Waitlist
                  </span>
                </div>
                <div className="text-3xl font-serif text-gray-500">
                  {stats.waitlist}
                </div>
              </div>
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-[#fce7f3]">
                <button
                  onClick={() => setGuestViewMode("main")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    guestViewMode === "main"
                      ? "bg-[#8b4545] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Main List
                </button>
                <button
                  onClick={() => setGuestViewMode("waitlist")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    guestViewMode === "waitlist"
                      ? "bg-[#8b4545] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Waitlist
                </button>
              </div>

              <div className="flex gap-2">
                {guestViewMode === "waitlist" &&
                  selectedWaitlistIds.size > 0 && (
                    <button
                      onClick={handleMoveToMain}
                      className="flex items-center gap-2 bg-[#8b4545] text-white px-4 py-2 rounded-lg hover:bg-[#6d3636] transition shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Move to Main ({selectedWaitlistIds.size})
                    </button>
                  )}
                <button
                  onClick={() => setIsAddGuestModalOpen(true)}
                  className="flex items-center gap-2 bg-[#8b4545] text-white px-4 py-2 rounded-lg hover:bg-[#6d3636] transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Guest
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-[#5a2e2e] px-4 py-2 rounded-lg border border-[#fce7f3] hover:bg-gray-50 transition shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
              </div>
            </div>

            {/* Add Guest Modal */}
            {isAddGuestModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-serif text-[#5a2e2e]">
                      Add Guest
                    </h3>
                    <button
                      onClick={() => setIsAddGuestModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newGuestName}
                        onChange={(e) => setNewGuestName(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                        placeholder="Enter guest name"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewGuestType("adult")}
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            newGuestType === "adult"
                              ? "bg-[#8b4545] text-white border-[#8b4545]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Adult
                        </button>
                        <button
                          onClick={() => setNewGuestType("child")}
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            newGuestType === "child"
                              ? "bg-[#8b4545] text-white border-[#8b4545]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Child
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="waitlist-checkbox"
                        checked={newGuestWaitlist}
                        onChange={(e) => setNewGuestWaitlist(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#8b4545] focus:ring-[#8b4545]"
                      />
                      <label
                        htmlFor="waitlist-checkbox"
                        className="text-sm font-medium text-gray-700"
                      >
                        Add to waitlist
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setIsAddGuestModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddGuest}
                      disabled={
                        createGuestMutation.isPending || !newGuestName.trim()
                      }
                      className="bg-[#8b4545] text-white px-6 py-2 rounded-lg hover:bg-[#6d3636] transition disabled:opacity-50"
                    >
                      {createGuestMutation.isPending
                        ? "Adding..."
                        : "Add Guest"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Guest Modal */}
            {isEditGuestModalOpen && editingGuest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-serif text-[#5a2e2e]">
                      Edit Guest
                    </h3>
                    <button
                      onClick={() => setIsEditGuestModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editGuestForm.name}
                        onChange={(e) =>
                          setEditGuestForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                        placeholder="Enter guest name"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editGuestForm.email}
                        onChange={(e) =>
                          setEditGuestForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                        placeholder="Enter email (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editGuestForm.phone}
                        onChange={(e) =>
                          setEditGuestForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                        placeholder="Enter phone (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditGuestForm((prev) => ({
                              ...prev,
                              type: "adult",
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            editGuestForm.type === "adult"
                              ? "bg-[#8b4545] text-white border-[#8b4545]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Adult
                        </button>
                        <button
                          onClick={() =>
                            setEditGuestForm((prev) => ({
                              ...prev,
                              type: "child",
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            editGuestForm.type === "child"
                              ? "bg-[#8b4545] text-white border-[#8b4545]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Child
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditGuestForm((prev) => ({
                              ...prev,
                              status: "pending",
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            editGuestForm.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() =>
                            setEditGuestForm((prev) => ({
                              ...prev,
                              status: "attending",
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            editGuestForm.status === "attending"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Attending
                        </button>
                        <button
                          onClick={() =>
                            setEditGuestForm((prev) => ({
                              ...prev,
                              status: "declined",
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                            editGuestForm.status === "declined"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Declined
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="edit-waitlist-checkbox"
                        checked={editGuestForm.isOnWaitlist}
                        onChange={(e) =>
                          setEditGuestForm((prev) => ({
                            ...prev,
                            isOnWaitlist: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#8b4545] focus:ring-[#8b4545]"
                      />
                      <label
                        htmlFor="edit-waitlist-checkbox"
                        className="text-sm font-medium text-gray-700"
                      >
                        On waitlist
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setIsEditGuestModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditGuest}
                      disabled={
                        updateGuestMutation.isPending ||
                        !editGuestForm.name.trim()
                      }
                      className="bg-[#8b4545] text-white px-6 py-2 rounded-lg hover:bg-[#6d3636] transition disabled:opacity-50"
                    >
                      {updateGuestMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-serif text-[#5a2e2e]">
                      Import Guests
                    </h3>
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Paste your guest list below.{" "}
                    <strong>One name per line.</strong>
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setImportType("adult")}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                          importType === "adult"
                            ? "bg-[#8b4545] text-white border-[#8b4545]"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        Adults
                      </button>
                      <button
                        onClick={() => setImportType("child")}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                          importType === "child"
                            ? "bg-[#8b4545] text-white border-[#8b4545]"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        Children
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b4545] font-mono text-sm mb-4"
                    placeholder={
                      "John Doe\nJane Doe\nMichael Smith\nEmily Johnson"
                    }
                  />

                  {importData.trim() && (
                    <div className="mb-4 p-3 bg-[#fff0f5] rounded-lg">
                      <p className="text-sm text-[#5a2e2e]">
                        <strong>
                          {importData.trim().split("\n").filter(Boolean).length}
                        </strong>{" "}
                        guests will be imported as{" "}
                        <strong>
                          {importType === "adult" ? "Adults" : "Children"}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkImport}
                      disabled={
                        bulkCreateMutation.isPending || !importData.trim()
                      }
                      className="bg-[#8b4545] text-white px-6 py-2 rounded-lg hover:bg-[#6d3636] transition disabled:opacity-50"
                    >
                      {bulkCreateMutation.isPending
                        ? "Importing..."
                        : "Import Guests"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#fce7f3] mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[#fce7f3] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#fff0f5] border-b border-[#fce7f3]">
                    <tr>
                      {guestViewMode === "waitlist" && (
                        <th className="px-6 py-4 w-10">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#8b4545] focus:ring-[#8b4545]"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWaitlistIds(
                                  new Set(filteredGuests.map((g) => g.id))
                                );
                              } else {
                                setSelectedWaitlistIds(new Set());
                              }
                            }}
                            checked={
                              filteredGuests.length > 0 &&
                              selectedWaitlistIds.size === filteredGuests.length
                            }
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#5a2e2e] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#5a2e2e] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#5a2e2e] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#5a2e2e] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-[#5a2e2e] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fce7f3]">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={guestViewMode === "waitlist" ? 6 : 5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          {searchTerm
                            ? "No guests found matching your search"
                            : "No guests have RSVP'd yet"}
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => (
                        <tr
                          key={guest.id}
                          className="hover:bg-[#fff0f5] transition-colors"
                        >
                          {guestViewMode === "waitlist" && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedWaitlistIds.has(guest.id)}
                                onChange={() =>
                                  toggleWaitlistSelection(guest.id)
                                }
                                className="rounded border-gray-300 text-[#8b4545] focus:ring-[#8b4545]"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 text-sm text-[#5a2e2e] font-medium">
                            {guest.name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                guest.type === "child"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {guest.type === "child" ? "Child" : "Adult"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {guest.email}
                          </td>
                          <td className="px-6 py-4">
                            {guest.status === "attending" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="w-3 h-3" />
                                Attending
                              </span>
                            ) : guest.status === "declined" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <X className="w-3 h-3" />
                                Declined
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Hourglass className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditGuest(guest)}
                                className="text-gray-400 hover:text-[#8b4545] transition p-1"
                                title="Edit guest"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteGuest(guest.id, guest.name)
                                }
                                className="text-gray-400 hover:text-red-500 transition p-1"
                                title="Remove guest"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Add Story Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fce7f3]">
              <h2 className="text-xl font-serif text-[#5a2e2e] mb-4">
                Add Photos
              </h2>
              <form onSubmit={handeUpload} className="space-y-4">
                {/* Drag and drop area could be implemented here, using simple input for now */}

                <div className="group border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#8b4545] transition cursor-pointer relative bg-gray-50 hover:bg-white">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    accept="image/*"
                    multiple
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileSelect}
                  />
                  <div className="text-gray-500">
                    {selectedFiles && selectedFiles.length > 0 ? (
                      <div>
                        <p className="font-medium text-[#8b4545] mb-1">
                          {selectedFiles.length} photo
                          {selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <p className="text-sm text-gray-400">
                          {Array.from(selectedFiles)
                            .map((f) => f.name)
                            .join(", ")}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-[#8b4545] mb-1">
                          Click to select or drag photos here
                        </p>
                        <p className="text-sm">
                          You can select multiple photos
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Taken{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional, defaults to today)
                      </span>
                    </label>
                    <input
                      type="date"
                      name="takenAt"
                      className="w-full p-2 border border-gray-200 rounded-lg text-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      className="w-full p-2 border border-gray-200 rounded-lg text-black"
                      placeholder="Shared description for these photos..."
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8b4545] font-medium animate-pulse">
                    {isUploading && uploadProgress}
                  </span>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-[#8b4545] text-white px-6 py-2 rounded-lg hover:bg-[#6d3636] transition disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload Photos"}
                  </button>
                </div>
              </form>
            </div>

            {/* Stories Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-xl shadow-sm border border-[#fce7f3] overflow-hidden group"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={story.imageUrl}
                      alt={story.description}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(story)}
                        className="bg-[#8b4545] text-white px-6 py-2 rounded-xl hover:bg-[#6d3636] transition shadow-lg font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteStory(story.id, story.imageUrl)
                        }
                        className="bg-white text-[#8b4545] px-6 py-2 rounded-xl hover:bg-gray-50 transition shadow-lg font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {editingStoryId === story.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Date Taken
                          </label>
                          <input
                            type="date"
                            value={editForm.takenAt}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                takenAt: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(story.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8b4545] text-white hover:bg-[#6d3636] transition shadow-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-[#8b4545] font-medium mb-2">
                          {new Date(story.takenAt).toLocaleDateString("en-US", {
                            dateStyle: "long",
                            timeZone: "UTC",
                          })}
                        </div>
                        {story.description && (
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {story.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isLoadingStories && stories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No stories to show yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
