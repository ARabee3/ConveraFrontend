"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

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
    queryFn: () =>
      api
        .get<{ preferences: Preference[] }>("/notifications/preferences")
        .then((r) => r.data),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      category,
      enabled,
    }: {
      category: string;
      enabled: boolean;
    }) => api.patch("/notifications/preferences", { category, enabled }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });

  if (!user) return <LoadingSpinner fullPage />;

  const preferences = data?.preferences || [];

  const categories = [
    {
      key: "REMINDERS",
      label: "Reminders",
      description: "Booking and event reminders",
    },
    {
      key: "CHAT_ALERTS",
      label: "Chat Alerts",
      description: "New message notifications",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Breadcrumb
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Notifications" },
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Notification Settings
          </h1>
          <p className="text-neutral-500 text-sm">
            Manage your notification preferences
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-2xl p-5 animate-pulse h-20"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
          {categories.map((cat) => {
            const pref = preferences.find((p) => p.category === cat.key);
            const enabled = pref?.enabled ?? true;

            return (
              <div
                key={cat.key}
                className="p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-neutral-900">{cat.label}</h3>
                  <p className="text-sm text-neutral-500">{cat.description}</p>
                </div>
                <ToggleSwitch
                  checked={enabled}
                  onChange={(checked) =>
                    updateMutation.mutate({ category: cat.key, enabled: checked })
                  }
                  disabled={updateMutation.isPending}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
