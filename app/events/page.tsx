"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type Event = {
  id: string;
  title: string;
  start_time: string;
  churchName: string;
  churchLocation: string;
};

type FilterType = "all" | "weekend" | "month";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const router = useRouter();

  /* =========================
     🔥 LOAD EVENTS (FIXED)
  ========================== */
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          start_time,
          churches (
            name,
            location
          )
        `)
        .order("start_time", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      // ✅ NORMALIZE DATA (FIX)
      const normalized = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        churchName: event.churches?.[0]?.name || "Unknown",
        churchLocation: event.churches?.[0]?.location || "",
      }));

      setEvents(normalized);
    };

    load();
  }, []);

  /* =========================
     🧠 DATE HELPERS
  ========================== */
  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 6 || day === 0;
  };

  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  /* =========================
     🔍 SEARCH + FILTER
  ========================== */
  useEffect(() => {
    let temp = [...events];

    // 🔍 SEARCH
    if (query) {
      const q = query.toLowerCase();

      temp = temp.filter((event) => {
        return (
          event.title?.toLowerCase().includes(q) ||
          event.churchName?.toLowerCase().includes(q) ||
          event.churchLocation?.toLowerCase().includes(q)
        );
      });
    }

    // 📅 FILTER
    if (filter === "weekend") {
      temp = temp.filter((e) => isWeekend(e.start_time));
    }

    if (filter === "month") {
      temp = temp.filter((e) => isThisMonth(e.start_time));
    }

    setFiltered(temp);
  }, [query, filter, events]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* 🔍 SEARCH BAR */}
        <div className="mb-4 relative">
          <div className="flex items-center bg-white rounded-full px-4 py-3 shadow border">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search events, churches, locations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        {/* 🎯 FILTERS */}
        <div className="flex gap-2 mb-6">
          {[
            { label: "All", value: "all" },
            { label: "This Month", value: "month" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as FilterType)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filter === f.value
                  ? "bg-black text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 📦 EVENTS */}
        <div className="space-y-4">

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500 mb-3">
                No events found
              </p>
              <button
                onClick={() =>
                  router.push(`/events/add?title=${encodeURIComponent(query)}`)
                }
                className="bg-black text-white px-5 py-2 rounded-full text-sm"
              >
                + Add this event
              </button>
            </div>
          )}

          {filtered.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer border"
            >
              {/* TITLE */}
              <h2 className="font-semibold text-gray-900 text-base mb-1">
                {event.title}
              </h2>

              {/* CHURCH */}
              <p className="text-sm text-gray-500 mb-2">
                {event.churchName} • {event.churchLocation}
              </p>

              {/* DATE + TIME */}
              <div className="flex items-center gap-4 text-xs text-gray-400">

                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {new Date(event.start_time).toLocaleDateString("en-ZA", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {new Date(event.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}