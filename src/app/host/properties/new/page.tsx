"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { hostApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

export default function NewPropertyPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "HOST" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "APARTMENT", latitude: 30.0444, longitude: 31.2357 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      hostApi.createProperty({
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
    onSuccess: () => router.push("/host/properties"),
  });

  const [serverError, setServerError] = [mutation.error, mutation.reset];

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/host/properties" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
      <p className="text-gray-500 mb-8">Fill in the details to list your property</p>

      {mutation.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create property."}
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
          <Button type="submit" isLoading={mutation.isPending} size="lg" className="flex-1">
            Create Property
          </Button>
          <Link href="/host/properties">
            <Button type="button" variant="secondary" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
