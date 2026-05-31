"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { hostApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["APARTMENT", "HOTEL"]),
  address: z.string().min(5, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  basePrice: z.number().positive("Price must be positive"),
  amenitiesStr: z.string().optional(),
  imageUrlsStr: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "HOST" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ["host-properties"],
    queryFn: () => hostApi.listProperties().then((r) => r.data),
    enabled: !!user,
  });

  const property = properties?.find((p) => p.id === id);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "APARTMENT",
      latitude: 30.0444,
      longitude: 31.2357,
    },
  });

  // Pre-fill form when property loads
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        type: property.type,
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        basePrice: property.basePrice,
        amenitiesStr: property.amenities?.join(", ") || "",
        imageUrlsStr: property.imageUrls?.join(", ") || "",
      });
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      hostApi.updateProperty(id, {
        title: data.title,
        description: data.description,
        type: data.type,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        basePrice: data.basePrice,
        amenities: data.amenitiesStr ? data.amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
        imageUrls: data.imageUrlsStr ? data.imageUrlsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      router.push("/host/properties");
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  if (!user || loadingProperties) return <LoadingSpinner fullPage />;
  if (!property) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      <p className="text-gray-500">Property not found.</p>
      <Link href="/host/properties" className="text-[#FF385C] mt-4 inline-block">← Back to dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/host/properties" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
      <p className="text-gray-500 mb-8">Update your property listing</p>

      {mutation.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update property."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8">
        <Input id="title" label="Property title" placeholder="Cozy apartment in Cairo" error={errors.title?.message} {...register("title")} />

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Description</label>
          <textarea
            rows={4}
            placeholder="Describe your property..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 resize-none"
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Property type</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900"
            {...register("type")}
          >
            <option value="APARTMENT">Apartment</option>
            <option value="HOTEL">Hotel</option>
          </select>
        </div>

        <Input id="address" label="Address" placeholder="123 Nile Corniche, Cairo" error={errors.address?.message} {...register("address")} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="latitude" type="number" step="any" label="Latitude" placeholder="30.0444" error={errors.latitude?.message} {...register("latitude", { valueAsNumber: true })} />
          <Input id="longitude" type="number" step="any" label="Longitude" placeholder="31.2357" error={errors.longitude?.message} {...register("longitude", { valueAsNumber: true })} />
        </div>

        <Input id="basePrice" type="number" step="0.01" label="Price per night (EGP)" placeholder="500" error={errors.basePrice?.message} {...register("basePrice", { valueAsNumber: true })} />

        <Input
          id="amenitiesStr"
          label="Amenities (comma-separated)"
          placeholder="WiFi, Pool, Parking, AC"
          error={errors.amenitiesStr?.message}
          {...register("amenitiesStr")}
        />

        <Input
          id="imageUrlsStr"
          label="Image URLs (comma-separated)"
          placeholder="https://example.com/img1.jpg, https://..."
          error={errors.imageUrlsStr?.message}
          {...register("imageUrlsStr")}
        />

        <div className="flex gap-4 pt-2">
          <Button type="submit" isLoading={mutation.isPending || isSubmitting} size="lg" className="flex-1">
            Save Changes
          </Button>
          <Link href="/host/properties">
            <Button type="button" variant="secondary" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
