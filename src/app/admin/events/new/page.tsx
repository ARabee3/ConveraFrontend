"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { adminEventsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string().min(1, "Date is required"),
  address: z.string().min(5),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  price: z.number().nonnegative(),
  maxCapacity: z.number().int().positive(),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  minAge: z.number().optional(),
  ticketTypesStr: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewEventPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") router.push("/");
  }, [user, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { locationLat: 30.0444, locationLng: 31.2357, price: 0, maxCapacity: 100 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      adminEventsApi.create({
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        address: data.address,
        price: data.price,
        categoryId: data.categoryId,
        maxCapacity: data.maxCapacity,
        coverImage: data.coverImage || "",
        eligibility: {
          minAge: data.minAge,
          ticketTypes: data.ticketTypesStr
            ? data.ticketTypesStr.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          specialRequirements: data.specialRequirements,
        },
      }),
    onSuccess: () => router.push("/admin/events"),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin/events" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to events
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
      <p className="text-gray-500 mb-8">Fill in the event details</p>

      {mutation.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create event."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8">
        <Input id="title" label="Event title" placeholder="Summer Music Festival" error={errors.title?.message} {...register("title")} />

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Description</label>
          <textarea rows={4} placeholder="Describe the event..." className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 resize-none" {...register("description")} />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1.5">Date & Time</label>
          <input type="datetime-local" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900" {...register("date")} />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
        </div>

        <Input id="address" label="Address" placeholder="123 Concert Ave, Cairo" error={errors.address?.message} {...register("address")} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="locationLat" type="number" step="any" label="Latitude" error={errors.locationLat?.message} {...register("locationLat", { valueAsNumber: true })} />
          <Input id="locationLng" type="number" step="any" label="Longitude" error={errors.locationLng?.message} {...register("locationLng", { valueAsNumber: true })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input id="price" type="number" step="0.01" label="Price (EGP)" placeholder="150" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
          <Input id="maxCapacity" type="number" label="Max capacity" placeholder="1000" error={errors.maxCapacity?.message} {...register("maxCapacity", { valueAsNumber: true })} />
        </div>

        <Input id="categoryId" label="Category ID (UUID)" placeholder="uuid-of-category" error={errors.categoryId?.message} {...register("categoryId")} />

        <Input id="coverImage" type="url" label="Cover image URL" placeholder="https://example.com/cover.jpg" error={errors.coverImage?.message} {...register("coverImage")} />

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Eligibility (optional)</h3>
          <div className="space-y-4">
            <Input id="minAge" type="number" label="Minimum age" placeholder="18" {...register("minAge", { valueAsNumber: true })} />
            <Input id="ticketTypesStr" label="Ticket types (comma-separated)" placeholder="General, VIP, Student" {...register("ticketTypesStr")} />
            <Input id="specialRequirements" label="Special requirements" placeholder="Valid ID required" {...register("specialRequirements")} />
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Button type="submit" isLoading={mutation.isPending} size="lg" className="flex-1">
            Create Event
          </Button>
          <Link href="/admin/events">
            <Button type="button" variant="secondary" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
