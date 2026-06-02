"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronLeft, Tag } from "lucide-react";
import Link from "next/link";
import { adminEventsApi, eventsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminCategoriesPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") router.push("/");
  }, [user, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => eventsApi.getCategories().then((r) => r.data),
    enabled: !!user && (user.role === "ADMIN" || user.role === "SYSTEM_ADMIN"),
  });

  const createMutation = useMutation({
    mutationFn: () => adminEventsApi.createCategory({ name: newName, description: newDescription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["eventCategories"] });
      setIsCreating(false);
      setNewName("");
      setNewDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminEventsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["eventCategories"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newDescription.trim()) {
      createMutation.mutate();
    }
  };

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  const categories = data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Categories</h1>
          <p className="text-gray-500 mt-1">Manage categories for events</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col gap-4 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900">Create Category</h2>
          <Input 
            id="name" 
            label="Category Name" 
            placeholder="e.g. Technology" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required
          />
          <Input 
            id="description" 
            label="Description" 
            placeholder="e.g. Tech events and meetups" 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)} 
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h2>
          <p className="text-gray-500 text-sm mb-6">Create the first event category to get started.</p>
          <Button onClick={() => setIsCreating(true)}>Create Category</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-3xl">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Description</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{cat.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
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
