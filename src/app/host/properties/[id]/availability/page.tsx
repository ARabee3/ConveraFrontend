"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Tag } from "lucide-react";
import { hostApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

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
        overridePrice: status === "PRICE_OVERRIDE" && overridePrice !== "" ? Number(overridePrice) : undefined,
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
      setError(e?.response?.data?.message || "Failed to update availability");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }
    setError("");
    mutation.mutate();
  };

  if (!user || isLoading) return <LoadingSpinner fullPage />;

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="Property not found"
          description="The property you are looking for does not exist or has been removed."
          action={{ label: "Back to dashboard", onClick: () => router.push("/host/properties") }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumb
        items={[
          { label: "Host Dashboard", href: "/host/properties" },
          { label: "Manage Availability" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
        Manage Availability
      </h1>
      <p className="text-neutral-500 mb-8">{property.title}</p>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        {/* Status selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-3">Action type</label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                status === "BLOCKED"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-400"
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
              <Lock className="h-5 w-5 text-neutral-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Block Dates</p>
                <p className="text-xs text-neutral-500">Make property unavailable</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-150 ${
                status === "PRICE_OVERRIDE"
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-400"
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
              <Tag className="h-5 w-5 text-neutral-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Price Override</p>
                <p className="text-xs text-neutral-500">Set custom price for dates</p>
              </div>
            </label>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            type="date"
            label="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Price override */}
        {status === "PRICE_OVERRIDE" && (
          <Input
            type="number"
            label="Override price per night (EGP)"
            placeholder="e.g. 2500"
            value={overridePrice}
            onChange={(e) => setOverridePrice(e.target.value)}
            required
          />
        )}

        <Button type="submit" className="w-full py-3" isLoading={mutation.isPending}>
          {status === "BLOCKED" ? "Block Dates" : "Set Price Override"}
        </Button>
      </form>

      {/* Current base price */}
      <div className="mt-8 bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
        <p className="text-sm text-neutral-500">Current base price</p>
        <p className="text-2xl font-bold text-neutral-900 mt-1">{formatPrice(property.basePrice)}</p>
        <p className="text-xs text-neutral-400 mt-1">/ night</p>
      </div>
    </div>
  );
}
