"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function FirstEventOnboarding() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const createEvent = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("church_id")
      .eq("id", user.id)
      .single();

    if (!profile?.church_id) {
      router.push("/onboarding/church");
      return;
    }

    await supabase.from("events").insert({
      title,
      start_time: date,
      church_id: profile.church_id,
      created_by: user.id,
    });

    router.push("/feed");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add First Church Event</h1>

      <input
        className="w-full border p-3 rounded-lg mb-3"
        placeholder="Event Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="datetime-local"
        className="w-full border p-3 rounded-lg mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button
        onClick={createEvent}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        Create Event
      </button>
    </div>
  );
}