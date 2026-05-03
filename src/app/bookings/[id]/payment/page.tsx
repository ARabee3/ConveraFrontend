"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Landmark } from "lucide-react";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<"STRIPE" | "PAYMOB">("STRIPE");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const payMutation = useMutation({
    mutationFn: () => paymentsApi.initialize(id, provider),
    onSuccess: (res) => {
      window.location.href = res.data.paymentUrl;
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Payment initialization failed.");
    },
  });

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h1>
        <p className="text-gray-500 text-sm mb-8">
          Booking <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{id}</span>
        </p>

        {/* Provider Selection */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-800 mb-3">Select payment method</p>
          <div className="space-y-3">
            {/* Stripe */}
            <label
              className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition-all ${
                provider === "STRIPE"
                  ? "border-[#FF385C] bg-red-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value="STRIPE"
                checked={provider === "STRIPE"}
                onChange={() => setProvider("STRIPE")}
                className="sr-only"
              />
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Stripe</p>
                <p className="text-xs text-gray-500">Credit/debit card, Apple Pay, Google Pay</p>
              </div>
              {provider === "STRIPE" && (
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-[#FF385C] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />
                </div>
              )}
            </label>

            {/* Paymob */}
            <label
              className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer transition-all ${
                provider === "PAYMOB"
                  ? "border-[#FF385C] bg-red-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value="PAYMOB"
                checked={provider === "PAYMOB"}
                onChange={() => setProvider("PAYMOB")}
                className="sr-only"
              />
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Paymob</p>
                <p className="text-xs text-gray-500">Local Egyptian payment gateway</p>
              </div>
              {provider === "PAYMOB" && (
                <div className="ml-auto w-5 h-5 rounded-full border-2 border-[#FF385C] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />
                </div>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <Button
          className="w-full py-3 text-base"
          onClick={() => payMutation.mutate()}
          isLoading={payMutation.isPending}
        >
          Pay with {provider === "STRIPE" ? "Stripe" : "Paymob"}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You will be redirected to the payment provider to complete your payment.
        </p>
      </div>
    </div>
  );
}
