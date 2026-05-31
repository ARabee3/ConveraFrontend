"use client";

import { useParams } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaymentCancelPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 text-sm mb-2">
          We couldn&apos;t process your payment. Your booking is still pending.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Booking ID: <span className="font-mono">{id}</span>
        </p>

        <div className="space-y-3">
          <Link href={`/bookings/${id}/payment`}>
            <Button className="w-full py-3 gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </Link>
          <Link href="/bookings">
            <Button variant="secondary" className="w-full py-3 gap-2">
              <Home className="w-4 h-4" /> My Bookings
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}
