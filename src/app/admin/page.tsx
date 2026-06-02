"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const bookingStatusConfig: Record<string, { variant: "default" | "primary" | "success" | "warning" | "error" | "neutral"; label: string }> = {
  PENDING_PAYMENT: { variant: "warning", label: "Pending Payment" },
  CONFIRMED: { variant: "success", label: "Confirmed" },
  CANCELLED: { variant: "error", label: "Cancelled" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

export default function AdminDashboardPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, hydrated, router]);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => adminApi.getMetrics().then((r) => r.data),
    enabled: !!user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN"),
  });

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

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
      color: "bg-emerald-500",
      href: "/admin/properties",
    },
    {
      title: "Active Events",
      value: metrics?.events.active ?? 0,
      icon: Calendar,
      color: "bg-violet-500",
      href: "/admin/events",
    },
    {
      title: "Total Revenue",
      value: formatPrice(metrics?.revenue.total ?? 0),
      icon: CreditCard,
      color: "bg-primary-600",
      href: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumb items={[{ label: "Admin Dashboard" }]} className="mb-6" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="text-neutral-500 mt-1">Overview of platform metrics</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-[2rem] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 ${card.color} rounded-lg flex items-center justify-center`}>
                    <card.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  {card.href && (
                    <Link
                      href={card.href}
                      className="text-xs text-neutral-400 hover:text-primary-600 flex items-center gap-1 transition-colors"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
                <p className="text-sm text-neutral-500">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Users by Role */}
          {metrics?.users.byRole && (
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-[2rem] p-8 mb-8 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Users by Role</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {Object.entries(metrics.users.byRole).map(([role, count]) => (
                  <div key={role} className="bg-white/40 rounded-2xl p-5 text-center border border-white shadow-sm">
                    <p className="text-xl font-bold text-neutral-900">{count}</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings by Status */}
          {metrics?.bookings.byStatus && (
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-[2rem] p-8 mb-8 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Bookings by Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {Object.entries(metrics.bookings.byStatus).map(([status, count]) => {
                  const cfg = bookingStatusConfig[status] || { variant: "neutral" as const, label: status };
                  return (
                    <div key={status} className="rounded-2xl p-5 text-center bg-white/40 border border-white shadow-sm">
                      <p className="text-xl font-bold text-neutral-900">{count}</p>
                      <div className="mt-1">
                        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Manage Users", href: "/admin/users" },
              { label: "Manage Properties", href: "/admin/properties" },
              { label: "Manage Events", href: "/admin/events" },
              { label: "Manage Categories", href: "/admin/categories" },
              { label: "Activity Logs", href: "/admin/activity-logs" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-[1.5rem] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group"
              >
                <span className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{link.label}</span>
                <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
