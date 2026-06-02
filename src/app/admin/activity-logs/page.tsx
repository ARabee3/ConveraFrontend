"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const actionTypes = [
  "USER_SUSPENDED",
  "USER_ACTIVATED",
  "PROPERTY_HIDDEN",
  "PROPERTY_REMOVED",
  "PROPERTY_ACTIVATED",
  "EVENT_UPDATED",
];

export default function AdminActivityLogsPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") router.push("/");
  }, [user, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity-logs", actionType, startDate, endDate],
    queryFn: () =>
      adminApi.getActivityLogs({
        actionType: actionType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        take: 50,
      }).then((r) => r.data),
    enabled: !!user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN"),
  });

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  const logs = data?.data || [];

  const actionColors: Record<string, string> = {
    USER_SUSPENDED: "bg-red-100 text-red-700",
    USER_ACTIVATED: "bg-green-100 text-green-700",
    PROPERTY_HIDDEN: "bg-yellow-100 text-yellow-700",
    PROPERTY_REMOVED: "bg-red-100 text-red-700",
    PROPERTY_ACTIVATED: "bg-green-100 text-green-700",
    EVENT_UPDATED: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 mt-1">Audit trail of admin actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Action Type</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          >
            <option value="">All actions</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Action</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Actor</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Target</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Details</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionColors[log.actionType] || "bg-gray-100 text-gray-700"}`}>
                      {log.actionType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.actorEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.targetEntityType} <span className="text-gray-400">({log.targetEntityId.slice(0, 8)}...)</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(log.metadata).slice(0, 60)}...
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-400">No activity logs found.</div>
          )}
        </div>
      )}
    </div>
  );
}
