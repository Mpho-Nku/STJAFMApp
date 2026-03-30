"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

type Event = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;        // ✅ unified location
  churchName: string;
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          start_time,
          end_time,
          location,
          churches (
            name,
            location
          )
        `)
        .eq("created_by", user.id)
        .order("start_time", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        const normalized = (data || []).map((event: any) => {
          const church = Array.isArray(event.churches)
            ? event.churches[0]
            : event.churches;

          return {
            id: event.id,
            title: event.title,
            start_time: event.start_time,
            end_time: event.end_time,

            churchName: church?.name || "No church",

            // 🔥 unified location logic
            location:
              event.location ||
              church?.location ||
              "No location",
          };
        });

        setEvents(normalized);
      }

      setLoading(false);
    };

    fetchEvents();
  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading your events...
      </div>
    );
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
      >
        <span className="text-lg">←</span>
        Back
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">My Events</h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/events/add")}
          className="bg-black text-white px-5 py-2 rounded-full flex items-center gap-2"
        >
          <CalendarDaysIcon className="w-5 h-5" />
          Create Event
        </motion.button>
      </div>

      {/* EMPTY */}
      {events.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border">
          <p className="text-gray-500 mb-4">
            You haven’t created any events yet.
          </p>

          <button
            onClick={() => router.push("/events/add")}
            className="bg-black text-white px-6 py-2 rounded-full"
          >
            Create your first event
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event, index) => {
          const isPast = new Date(event.start_time) < new Date();

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition p-5"
            >
              {/* CLICK AREA */}
              <div
                onClick={() => router.push(`/events/${event.id}`)}
                className="cursor-pointer group"
              >
                {/* TITLE */}
                <h2 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition">
                  {event.title}
                </h2>

                {/* DATE */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {formatDate(event.start_time)}
                </div>

                {/* END DATE */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>⏳</span>
                  {event.end_time
                    ? formatDate(event.end_time)
                    : "No end date"}
                </div>

                {/* LOCATION (UNIFIED) */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>📍</span>
                  {event.location}
                </div>

                {/* CHURCH */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <BuildingLibraryIcon className="w-4 h-4" />
                  {event.churchName}
                </div>

                {/* STATUS */}
                <div className="mt-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      isPast
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isPast ? "Past Event" : "Upcoming Event"}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t" />

              {/* EDIT */}
              <div
                onClick={() => router.push(`/events/${event.id}/edit`)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-gray-700 group-hover:text-blue-600 transition">
                  <PencilSquareIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Edit Event
                  </span>
                </div>

                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}