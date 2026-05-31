"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Lock, Tag } from "lucide-react";
import Link from "next/link";
import { hostApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

type AvailabilityStatus = "BLOCKED" | "PRICE_OVERRIDE";

export default function PropertyAvailabilityPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("BLOCKED");
  const [overridePrice, setOverridePrice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "HOST" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["host-properties"],
    queryFn: () => hostApi.listProperties().then((r) => r.data),
    enabled: !!user,
  });

  const property = properties?.find((p) => p.id === id);

  const mutation = useMutation({
    mutationFn: () =>
      hostApi.updateAvailability(id, {
        startDate,
        endDate,
        status,
        overridePrice: status === "PRICE_OVERRIDE" && overridePrice ? Number(overridePrice) : undefined,
      }),
    onSuccess: () => {
      setStartDate("");
      setEndDate("");
      setOverridePrice("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["host-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Failed to update availability.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }
    if (status === "PRICE_OVERRIDE" && (!overridePrice || Number(overridePrice) <= 0)) {
      setError("Please enter a valid override price.");
      return;
    }
    setError("");
    mutation.mutate();
  };

  if (!user || isLoading) return <LoadingSpinner fullPage />;
  if (!property) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p className="text-gray-500">Property not found.</p>
      <Link href="/host/properties" className="text-[#FF385C] mt-4 inline-block">← Back to dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/host/properties" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Availability</h1>
      <p className="text-gray-500 mb-8">{property.title}</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
        {/* Status selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-3">Action type</label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                status === "BLOCKED"
                  ? "border-[#FF385C] bg-red-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="BLOCKED"
                checked={status === "BLOCKED"}
                onChange={() => setStatus("BLOCKED")}
                className="sr-only"
              />
              <Lock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Block Dates</p>
                <p className="text-xs text-gray-500">Make property unavailable</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                status === "PRICE_OVERRIDE"
                  ? "border-[#FF385C] bg-red-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="PRICE_OVERRIDE"
                checked={status === "PRICE_OVERRIDE"}
                onChange={() => setStatus("PRICE_OVERRIDE")}
                className="sr-only"
              />
              <Tag className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Price Override</p>
                <p className="text-xs text-gray-500">Set custom price for dates</p>
              </div>
            </label>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        {/* Override price (conditional) */}
        {status === "PRICE_OVERRIDE" && (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Override price per night (EGP)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 200"
              value={overridePrice}
              onChange={(e) => setOverridePrice(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current base price: {formatPrice(property.basePrice)}
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Button type="submit" isLoading={mutation.isPending} size="lg" className="flex-1">
            {status === "BLOCKED" ? "Block Dates" : "Set Override Price"}
          </Button>
          <Link href="/host/properties">
            <Button type="button" variant="secondary" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
