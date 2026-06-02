"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminPropertiesPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") router.push("/");
  }, [user, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties", search, statusFilter],
    queryFn: () =>
      adminApi.listProperties({
        search: search || undefined,
        status: statusFilter || undefined,
        take: 50,
      }).then((r) => r.data),
    enabled: !!user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      adminApi.changePropertyStatus(id, { status, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const handleChangeStatus = (id: string, title: string, currentStatus: string) => {
    const statuses = ["active", "hidden", "removed"];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    if (confirm(`Change "${title}" status to ${nextStatus}?`)) {
      statusMutation.mutate({
        id,
        status: nextStatus,
        reason: `Status changed to ${nextStatus} by admin`,
      });
    }
  };

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  const properties = data?.data || [];

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    hidden: "bg-yellow-100 text-yellow-700",
    removed: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage all platform properties</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Property</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden sm:table-cell">Host</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Bookings</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">{p.hostEmail}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">{p.type}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[p.listingStatus] || "bg-gray-100 text-gray-700"}`}>
                      {p.listingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">{p.bookingCount}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleChangeStatus(p.id, p.title, p.listingStatus)}
                      disabled={statusMutation.isPending}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Change status"
                    >
                      {p.listingStatus === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {properties.length === 0 && (
            <div className="text-center py-12 text-gray-400">No properties found.</div>
          )}
        </div>
      )}
    </div>
  );
}
