"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminApi.getMetrics().then((r) => r.data),
    enabled: !!user && user.role === "SYSTEM_ADMIN",
  });

  if (!user) return <LoadingSpinner fullPage />;

  const cards = [
    {
      title: "Total Users",
      value: metrics?.users.total ?? 0,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/users",
    },
    {
      title: "Active Properties",
      value: metrics?.properties.active ?? 0,
      icon: Building2,
      color: "bg-green-500",
      href: "/admin/properties",
    },
    {
      title: "Active Events",
      value: metrics?.events.active ?? 0,
      icon: Calendar,
      color: "bg-purple-500",
      href: "/admin/events",
    },
    {
      title: "Total Revenue",
      value: formatPrice(metrics?.revenue.total ?? 0),
      icon: CreditCard,
      color: "bg-[#FF385C]",
      href: null,
    },
  ];

  const bookingStatusColors: Record<string, string> = {
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform metrics</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  {card.href && (
                    <Link href={card.href} className="text-xs text-gray-400 hover:text-[#FF385C] flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Users by Role */}
          {metrics?.users.byRole && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Users by Role</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(metrics.users.byRole).map(([role, count]) => (
                  <div key={role} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 uppercase">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings by Status */}
          {metrics?.bookings.byStatus && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(metrics.bookings.byStatus).map(([status, count]) => (
                  <div key={status} className={`rounded-xl p-4 text-center ${bookingStatusColors[status] || "bg-gray-100 text-gray-700"}`}>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs">{status.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Manage Users", href: "/admin/users" },
              { label: "Manage Properties", href: "/admin/properties" },
              { label: "Manage Events", href: "/admin/events" },
              { label: "Activity Logs", href: "/admin/activity-logs" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-card transition-shadow flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{link.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
