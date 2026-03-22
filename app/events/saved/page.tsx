"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  start_time: string;
  churches?: {
    image_url?: string | null;
  }[];
};

type SavedEventRow = {
  id: string;
  event: Event[];
};

export default function SavedEventsPage() {
  const [items, setItems] = useState<SavedEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      const { data } = await supabase
        .from("saved_events")
        .select(
          `
          id,
          event:events (
            id,
            title,
            start_time,
            churches (
              image_url
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      setItems((data as SavedEventRow[]) || []);
      setLoading(false);
    };

    loadSaved();
  }, []);

  if (loading) return <p className="p-6">Loading saved events…</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Saved Events</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No saved events.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((row) => {
            const ev = row.event?.[0];

            if (!ev) return null;

            const img =
              ev.churches?.[0]?.image_url || "/default_church.jpg";

            return (
              <Link
                key={row.id}
                href={`/events/${ev.id}`}
                className="block rounded-xl border bg-white shadow hover:shadow-lg transition"
              >
                <div className="relative h-48 rounded-t-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={ev.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg">
                    {ev.title}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {new Date(ev.start_time).toLocaleDateString("en-ZA", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}