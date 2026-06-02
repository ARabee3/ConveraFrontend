"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, ShieldAlert, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminUsersPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") router.push("/");
  }, [user, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        take: 50,
      }).then((r) => r.data),
    enabled: !!user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      adminApi.changeUserStatus(id, { status, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleToggleStatus = (id: string, email: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? "suspended" : "active";
    const reason = currentStatus
      ? "Suspended by admin"
      : "Reactivated by admin";
    if (confirm(`${currentStatus ? "Suspend" : "Activate"} user ${email}?`)) {
      statusMutation.mutate({ id, status: newStatus, reason });
    }
  };

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  const users = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage platform users</p>
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
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="HOST">Host</option>
            <option value="ADMIN">Admin</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
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
            <option value="suspended">Suspended</option>
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Joined</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.email, u.isActive)}
                      disabled={statusMutation.isPending}
                      className={`p-2 rounded-lg transition-colors ${
                        u.isActive
                          ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                          : "text-green-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      title={u.isActive ? "Suspend" : "Activate"}
                    >
                      {u.isActive ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
}
