"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ConfirmModal from "@/components/ConfirmModal";

type Event = {
  id: string;
  title: string;
  start_time: string;
  location: string;
  churchName: string;
};

export default function SavedEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  /* =========================
     LOAD SAVED EVENTS
  ========================== */
  useEffect(() => {
    const loadSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("saved_events")
        .select(`
          event_id,
          events (
            id,
            title,
            start_time,
            location,
            churches (
              name,
              location
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      const normalized = (data || []).map((item: any) => {
        const event = item.events;
        const church = Array.isArray(event?.churches)
          ? event.churches[0]
          : event?.churches;

        return {
          id: event.id,
          title: event.title,
          start_time: event.start_time,
          churchName: church?.name || "No church",

          // 🔥 unified location
          location:
            event.location ||
            church?.location ||
            "No location",
        };
      });

      setEvents(normalized);
    };

    loadSaved();
  }, [router]);

  /* =========================
     REMOVE SAVED EVENT
  ========================== */
  const removeSaved = async (eventId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("saved_events")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);

    // instant UI update
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  /* =========================
     DATE FORMAT
  ========================== */
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Events</h1>

        <button
          onClick={() => router.push("/events")}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Browse
        </button>
      </div>

      {/* EMPTY */}
      {events.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border">
          <p className="text-gray-500 mb-4">
            No saved events yet
          </p>

          <button
            onClick={() => router.push("/events")}
            className="bg-black text-white px-6 py-2 rounded-full"
          >
            Explore Events
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/events/${event.id}`)}
            className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer"
          >
            {/* TITLE */}
            <h2 className="font-semibold text-gray-900 mb-1">
              {event.title}
            </h2>

            {/* CHURCH + LOCATION */}
            <p className="text-sm text-gray-500">
              {event.churchName} • {event.location}
            </p>

            {/* DATE */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <CalendarDaysIcon className="w-4 h-4" />
              {formatDate(event.start_time)}
            </div>

            {/* BIN ICON */}
            <div className="mt-3 flex justify-end">
              <TrashIcon
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(event.id);
                  setShowModal(true);
                }}
                className="w-6 h-6 text-gray-400 hover:text-red-500 hover:scale-110 transition cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 CUSTOM MODAL */}
      <ConfirmModal
        isOpen={showModal}
        title="Remove event"
        description="Are you sure you want to remove this event from saved?"
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          if (selectedId) {
            removeSaved(selectedId);
          }
          setShowModal(false);
        }}
      />
    </div>
  );
}