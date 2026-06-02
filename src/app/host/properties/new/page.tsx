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
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["APARTMENT", "HOTEL"]),
  address: z.string().min(5, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  basePrice: z.number().positive("Price must be positive"),
  amenitiesStr: z.string().optional(),
  imageUrls: z.array(z.string()).min(1, "At least one image is required"),
});

type FormData = z.infer<typeof schema>;

export default function NewPropertyPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "HOST" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      router.push("/");
    }
  }, [user, hydrated, router]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "APARTMENT", imageUrls: [] },
  });

  const imageUrls = watch("imageUrls");
  const lat = watch("latitude");
  const lng = watch("longitude");
  const address = watch("address");

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
        imageUrls: data.imageUrls,
      }),
    onSuccess: () => router.push("/host/properties"),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/host/properties" className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Add New Property</h1>
      <p className="text-neutral-500 mb-8">Fill in the details to list your property</p>

      {mutation.error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create property."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <Input label="Property title" placeholder="Cozy apartment in Cairo" error={errors.title?.message} {...register("title")} />

        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">Description</label>
          <textarea
            rows={4}
            placeholder="Describe your property..."
            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none transition-all"
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs text-error-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1.5">Property type</label>
          <select
            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-white transition-all"
            {...register("type")}
          >
            <option value="APARTMENT">Apartment</option>
            <option value="HOTEL">Hotel</option>
          </select>
        </div>

        <LocationPicker
          lat={lat}
          lng={lng}
          address={address}
          onChange={(loc) => {
            setValue("address", loc.address);
            setValue("latitude", loc.lat);
            setValue("longitude", loc.lng);
          }}
        />
        {errors.address && <p className="text-xs text-error-600">{errors.address.message}</p>}
        {errors.latitude && <p className="text-xs text-error-600">{errors.latitude.message}</p>}
        {errors.longitude && <p className="text-xs text-error-600">{errors.longitude.message}</p>}

        <Input type="number" step="0.01" label="Price per night (EGP)" placeholder="500" error={errors.basePrice?.message} {...register("basePrice", { valueAsNumber: true })} />

        <Input
          label="Amenities (comma-separated)"
          placeholder="WiFi, Pool, Parking, AC"
          error={errors.amenitiesStr?.message}
          {...register("amenitiesStr")}
        />

        <ImageUploader
          value={imageUrls || []}
          onChange={(urls) => setValue("imageUrls", urls)}
          maxFiles={5}
          label="Property photos"
        />
        {errors.imageUrls && <p className="text-xs text-error-600">{errors.imageUrls.message}</p>}

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
