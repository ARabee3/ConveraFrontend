"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Building2, Eye, Calendar } from "lucide-react";
import { hostApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=60";

export default function HostPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "HOST" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["host-properties"],
    queryFn: () => hostApi.listProperties().then((r) => r.data),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hostApi.deleteProperty(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["host-properties"] }),
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
  };

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumb items={[{ label: "Host Dashboard" }]} className="mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Host Dashboard
          </h1>
          <p className="text-neutral-500 mt-1">Manage your property listings</p>
        </div>
        <Link href="/host/properties/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No properties yet"
          description="Add your first property to start hosting guests."
          action={{ label: "Add your first property", onClick: () => router.push("/host/properties/new") }}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th scope="col" className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Property
                  </th>
                  <th scope="col" className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Type
                  </th>
                  <th scope="col" className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Price/night
                  </th>
                  <th scope="col" className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={p.imageUrls?.[0] || PLACEHOLDER}
                          alt={p.title}
                          containerClassName="h-12 w-12 rounded-xl shrink-0"
                          className="rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate">{p.title}</p>
                          <p className="text-xs text-neutral-500 truncate">{p.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">{p.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-neutral-900">{formatPrice(p.basePrice)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.isActive ? "success" : "error"} size="sm">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/properties/${p.id}`}
                          className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="View"
                          aria-label={`View ${p.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/host/properties/${p.id}/edit`}
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/host/properties/${p.id}/availability`}
                          className="p-2 text-neutral-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                          title="Availability"
                          aria-label={`Availability for ${p.title}`}
                        >
                          <Calendar className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {properties.map((p) => (
              <div key={p.id} className="bg-white border border-neutral-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <SafeImage
                    src={p.imageUrls?.[0] || PLACEHOLDER}
                    alt={p.title}
                    containerClassName="h-14 w-14 rounded-xl shrink-0"
                    className="rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{p.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{p.address}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-medium text-neutral-900">{formatPrice(p.basePrice)}</span>
                      <Badge variant={p.isActive ? "success" : "error"} size="sm">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/properties/${p.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">View</Button>
                  </Link>
                  <Link href={`/host/properties/${p.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Edit</Button>
                  </Link>
                  <Link href={`/host/properties/${p.id}/availability`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Calendar</Button>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors border border-neutral-200"
                    aria-label={`Delete ${p.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
