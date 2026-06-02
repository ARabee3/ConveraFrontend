"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CreditCard, Landmark, FlaskConical } from "lucide-react";
import { paymentsApi, bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import axios from "axios";

type Provider = "MOCK" | "STRIPE" | "PAYMOB";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const [provider, setProvider] = useState<Provider>("MOCK");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push("/login");
  }, [user, hydrated, router]);

  const { data: booking, isLoading: loadingBooking, error: fetchError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.get(id).then((r) => r.data),
    enabled: !!user && !!id,
    retry: false,
  });

  const payMutation = useMutation({
    mutationFn: () =>
      paymentsApi.initialize(id, provider as "STRIPE" | "PAYMOB"),
    onSuccess: (res) => {
      window.location.href = res.data.paymentUrl;
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        (error?.response?.data?.message || "Payment provider unavailable") +
          ". Try using Mock Payment instead."
      );
    },
  });

  const mockMutation = useMutation({
    mutationFn: () => paymentsApi.confirmMock(id),
    onSuccess: () => {
      router.push(`/bookings/${id}/success`);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Mock payment failed. Try again.");
    },
  });

  const handlePay = () => {
    setError("");
    if (provider === "MOCK") {
      mockMutation.mutate();
    } else {
      payMutation.mutate();
    }
  };

  if (!hydrated || !user || loadingBooking) return <LoadingSpinner fullPage />;

  const isUnauthorized = axios.isAxiosError(fetchError) && fetchError.response?.status === 403;
  const isNotFound = (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) || !booking;

  if (isUnauthorized || (booking && booking.customerId !== user.id)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-12">
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="Unauthorized"
          description="This booking does not belong to you."
          action={{ label: "My Bookings", onClick: () => router.push("/bookings") }}
        />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-12">
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="Booking Not Found"
          description="The booking you are trying to pay for does not exist."
          action={{ label: "My Bookings", onClick: () => router.push("/bookings") }}
        />
      </div>
    );
  }

  const providers = [
    {
      key: "MOCK" as const,
      label: "Mock Payment (Instant)",
      description: "Confirm booking instantly — no real payment",
      icon: <FlaskConical className="h-5 w-5 text-white" />,
      iconBg: "bg-amber-500",
    },
    {
      key: "STRIPE" as const,
      label: "Stripe",
      description: "Credit/debit card, Apple Pay, Google Pay",
      icon: <CreditCard className="h-5 w-5 text-white" />,
      iconBg: "bg-indigo-600",
    },
    {
      key: "PAYMOB" as const,
      label: "Paymob",
      description: "Local Egyptian payment gateway",
      icon: <Landmark className="h-5 w-5 text-white" />,
      iconBg: "bg-emerald-600",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md border border-neutral-100">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Complete Payment
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Booking{" "}
          <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
            {id}
          </span>
        </p>

        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold text-neutral-800 mb-3">
            Select payment method
          </p>
          {providers.map((opt) => {
            const isActive = provider === opt.key;
            return (
              <label
                key={opt.key}
                className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={opt.key}
                  checked={isActive}
                  onChange={() => setProvider(opt.key)}
                  className="sr-only"
                />
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{opt.label}</p>
                  <p className="text-xs text-neutral-500">{opt.description}</p>
                </div>
                <div
                  className={`ml-auto h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    isActive ? "border-primary-600" : "border-neutral-300"
                  }`}
                >
                  {isActive && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <Button
          className="w-full py-3 text-base"
          onClick={handlePay}
          isLoading={payMutation.isPending || mockMutation.isPending}
        >
          {provider === "MOCK"
            ? "Confirm Payment"
            : `Pay with ${provider === "STRIPE" ? "Stripe" : "Paymob"}`}
        </Button>

        {provider !== "MOCK" && (
          <p className="text-center text-xs text-neutral-400 mt-4">
            You will be redirected to the payment provider.
            <br />
            <button
              onClick={() => setProvider("MOCK")}
              className="text-primary-600 hover:underline mt-1"
            >
              Use Mock Payment instead
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
