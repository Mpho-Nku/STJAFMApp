"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditEventForm({ event }: any) {
  const router = useRouter();

  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [startDate, setStartDate] = useState(
    event.start_time?.split("T")[0] || ""
  );

  const [loading, setLoading] = useState(false);

  const getEndDate = (start: string) => {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  };

  const handleUpdate = async () => {
    if (!title || !startDate) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    const start = new Date(startDate).toISOString();
    const end = getEndDate(startDate);

    const { error } = await supabase
      .from("events")
      .update({
        title,
        description,
        start_time: start,
        end_time: end,
      })
      .eq("id", event.id);

    setLoading(false);

    if (error) {
      alert("Failed to update event");
      return;
    }

    router.push(`/events/${event.id}`);
  };

  return (
    <div className="space-y-4">

      {/* TITLE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      {/* DATE */}
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Event description"
        className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
      />

      {/* BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full h-12 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition"
      >
        {loading ? "Updating..." : "Update Event"}
      </button>

    </div>
  );
}