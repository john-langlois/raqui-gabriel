"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function PasswordPrompt() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Invalid password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff5f7] px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-serif text-[#5a2e2e] mb-6 text-center">
          Admin Access
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#5a2e2e] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b4545]"
              placeholder="Enter admin password"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8b4545] text-white font-bold py-3 rounded-lg hover:bg-[#6d3636] transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
