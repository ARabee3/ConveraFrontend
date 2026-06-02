"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Download, Calendar, Users } from "lucide-react";
import { eventsApi, adminEventsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function AdminEventsPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsApi.list({ limit: 100 }).then((r) => r.data),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminEventsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  const importMutation = useMutation({
    mutationFn: () => adminEventsApi.importEvents(),
    onSuccess: (res) => {
      alert(`Import complete: ${res.data.imported} imported, ${res.data.updated} updated`);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete event "${title}"?`)) deleteMutation.mutate(id);
  };

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  const events = data?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin — Events</h1>
          <p className="text-gray-500 mt-1">Manage all platform events</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => importMutation.mutate()}
            isLoading={importMutation.isPending}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Import
          </Button>
          <Link href="/admin/events/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Event
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h2>
          <p className="text-gray-500 text-sm mb-6">Create your first event or import from external providers.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin/events/new"><Button>Create Event</Button></Link>
            <Button variant="secondary" onClick={() => importMutation.mutate()} isLoading={importMutation.isPending}>Import Events</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Event</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden md:table-cell">Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Capacity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4 hidden xl:table-cell">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60"}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60"; }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{ev.title}</p>
                        <p className="text-xs text-gray-500 truncate">{ev.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">{formatDate(ev.date)}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm font-medium text-gray-900">{formatPrice(ev.price)}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      {ev.remainingSpots}/{ev.maxCapacity}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ev.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {ev.status}
                    </span>
                    {ev.isSoldOut && <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Sold Out</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
