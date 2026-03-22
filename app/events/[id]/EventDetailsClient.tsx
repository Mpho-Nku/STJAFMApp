"use client";

import { motion } from "framer-motion";
import {
  MapPinIcon,
  CalendarDaysIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SaveButton } from "@/components/SaveButton";
import DeleteEventButton from "@/components/DeleteButton"; // ✅ ADD THIS

type Props = {
  event: any;
  isOwner: boolean;
  isSaved: boolean;
  reminderDays: number | null;
  user: any;
};

export default function EventDetailsClient({
  event,
  isOwner,
  isSaved,
  user,
}: Props) {
  const router = useRouter();

  const church = Array.isArray(event?.churches)
    ? event.churches[0]
    : event?.churches;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HERO */}
      <div className="relative h-[220px] w-full overflow-hidden rounded-b-3xl">
        <Image
          src={church?.image_url || "/default_church.jpg"}
          alt={event?.title || "Event"}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-xl font-bold">{event?.title}</h1>
          <p className="text-sm opacity-90">{church?.name}</p>

          {church?.pastor_name && (
            <p className="text-sm opacity-90">
              Hosted by: {church.pastor_name}
            </p>
          )}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-white/90 p-2 rounded-full shadow">
            <ShareIcon className="w-5 h-5" />
          </button>

          <SaveButton
            eventId={event.id}
            userId={user?.id}
            initialSaved={isSaved}
          />
        </div>
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto -mt-10 bg-white rounded-2xl shadow-xl p-6"
      >
        <p className="text-sm text-gray-500 mb-4">
          {church?.name}
        </p>

        {/* INFO */}
        <div className="space-y-4">

          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm">
              {startDate.toDateString()}
            </span>
            <span className="text-sm text-gray-400">
              → {endDate.toDateString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm">
              {church?.location}
            </span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">About this event</h2>
          <p className="text-sm text-gray-600">
            {event?.description || "No description provided."}
          </p>
        </div>

        {/* 🔥 EDIT + DELETE */}
        {isOwner && (
          <div className="mt-6 flex gap-3">

            <button
              onClick={() => router.push(`/events/${event.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              ✏️ Edit
            </button>

            <DeleteEventButton
              eventId={event.id}
              userId={user?.id}
            />
          </div>
        )}
      </motion.div>

      {/* STICKY CTA */}
 
    </div>
  );
}