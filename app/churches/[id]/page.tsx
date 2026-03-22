"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ChurchTypeTag from "@/components/churches/ChurchTypeTag";

export default function ChurchDetails({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [church, setChurch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadChurch = async () => {
      const { data } = await supabase
        .from("churches")
        .select("*")
        .eq("id", id)
        .single();

      setChurch(data);
    };

    const loadEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("church_id", id)
        .order("start_time", { ascending: true });

      setEvents(data || []);
    };

    loadChurch();
    loadEvents();
  }, [id]);

  if (!church) {
    return (
      <p className="p-10 text-center text-gray-500">
        Loading church…
      </p>
    );
  }

  const img = church.image_url || "/default_church.jpg";

  const fullAddress = [
    church.street,
    church.suburb,
    church.township,
    church.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* ← BACK (EXPLICIT, NOT history-based) */}
      <button
        onClick={() => router.push("/churches")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        ← Back to Churches
      </button>

      {/* IMAGE */}
      <div className="w-full h-72 relative rounded-xl overflow-hidden bg-gray-200">
        <Image
          src={img}
          alt={church.name}
          fill
          className="object-cover"
        />
      </div>

      {/* DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* NAME + TAG */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-blue-900">
            {church.name}
          </h1>

          <ChurchTypeTag type={church.type} />
        </div>

        <p className="text-gray-700">
          <strong>Pastor:</strong>{" "}
          {church.pastor_name || "N/A"}
        </p>

        <p className="text-gray-700">
          <strong>Location:</strong>{" "}
          {church.location  || "To be announced"}
        </p>

        {church.description && (
          <p className="text-gray-700 whitespace-pre-wrap">
            {church.description}
          </p>
        )}

        {church.location && (
          <a
            className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              church.location
            )}`}
            target="_blank"
          >
            📍 Get Directions
          </a>
        )}
      </div>

      {/* EVENTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">
            Upcoming Events
          </h2>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">
            No events scheduled.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="block p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">
                  {ev.title}
                </h3>

                {ev.start_time && (
                  <p className="text-sm text-gray-600">
                    {new Date(ev.start_time).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
