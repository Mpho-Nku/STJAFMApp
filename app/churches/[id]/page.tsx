"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserIcon } from "@heroicons/react/24/outline";
import {
  MapPinIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import ChurchTypeTag from "@/components/churches/ChurchTypeTag";

export default function ChurchDetails({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [church, setChurch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: churchData } = await supabase
        .from("churches")
        .select("*")
        .eq("id", id)
        .single();

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("church_id", id)
        .order("start_time", { ascending: true });

      setChurch(churchData);
      setEvents(eventsData || []);
    };

    load();
  }, [id]);

  if (!church) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading church…
      </div>
    );
  }

  const img = church.image_url || "/default_church.jpg";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔙 HEADER */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.push(`/churches`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition mb-4"
        >
          <span className="text-lg">←</span>
          Back
        </button>
      </div>

      {/* 🖼 HERO IMAGE */}
      <div className="relative w-full h-64 sm:h-80">
        <Image
          src={img}
          alt={church.name}
          fill
          className="object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {church.name}
          </h1>
          <div className="mt-2">
            <ChurchTypeTag type={church.type} />
          </div>
        </div>
      </div>

      {/* 📦 CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* DETAILS CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

          <div className="flex items-center gap-2 text-gray-700">
           <UserIcon className="w-4 h-4 text-gray-500" />
           <span className="font-medium">Pastor:</span>
           <span>{church.pastor_name || "N/A"}</span>
        </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPinIcon className="w-4 h-4 text-gray-500" />
            <span>{church.location || "To be announced"}</span>
          </div>

          {church.description && (
            <p className="text-gray-600 leading-relaxed">
              {church.description}
            </p>
          )}

          {/* CTA */}
          {church.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                church.location
              )}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <MapPinIcon className="w-4 h-4" />
              Get Directions
            </a>
          )}
        </div>

        {/* EVENTS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Upcoming Events
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-gray-500 border">
              No events scheduled yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev, index) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/events/${ev.id}`}
                    className="block bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">
                      {ev.title}
                    </h3>

                    {ev.start_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDaysIcon className="w-4 h-4" />
                        {new Date(ev.start_time).toLocaleDateString(
                          "en-ZA",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}