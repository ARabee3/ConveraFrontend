"use client";

import { useParams } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaymentCancelPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center border border-neutral-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100 mx-auto mb-6">
          <XCircle className="h-8 w-8 text-error-600" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-neutral-500 text-sm mb-2">
          We couldn&apos;t process your payment. Your booking is still pending.
        </p>
        <p className="text-neutral-400 text-xs mb-8">
          Booking ID: <span className="font-mono">{id}</span>
        </p>

        <div className="space-y-3">
          <Link href={`/bookings/${id}/payment`}>
            <Button className="w-full py-3 gap-2" leftIcon={<RefreshCw className="h-4 w-4" />}>
              Try Again
            </Button>
          </Link>
          <Link href="/bookings">
            <Button variant="secondary" className="w-full py-3 gap-2" leftIcon={<Home className="h-4 w-4" />}>
              My Bookings
            </Button>
          </Link>
        </div>

        <p className="text-xs text-neutral-400 mt-6">
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}
