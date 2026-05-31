"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

interface Preference {
  category: string;
  enabled: boolean;
}

export default function NotificationSettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => api.get<{ preferences: Preference[] }>("/notifications/preferences").then((r) => r.data),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ category, enabled }: { category: string; enabled: boolean }) =>
      api.patch("/notifications/preferences", { category, enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });

  if (!user) return <LoadingSpinner fullPage />;

  const preferences = data?.preferences || [];

  const categories = [
    { key: "REMINDERS", label: "Reminders", description: "Booking and event reminders" },
    { key: "CHAT_ALERTS", label: "Chat Alerts", description: "New message notifications" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#FF385C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-500 text-sm">Manage your notification preferences</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {categories.map((cat) => {
            const pref = preferences.find((p) => p.category === cat.key);
            const enabled = pref?.enabled ?? true;

            return (
              <div key={cat.key} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
                <button
                  onClick={() => updateMutation.mutate({ category: cat.key, enabled: !enabled })}
                  disabled={updateMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? "bg-[#FF385C]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
