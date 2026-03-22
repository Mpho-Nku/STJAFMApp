"use client";

import { useState } from "react";
import { BookmarkIcon as OutlineBookmark } from "@heroicons/react/24/outline";
import { BookmarkIcon as SolidBookmark } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabaseClient";

export function SaveButton({
  eventId,
  userId,
  initialSaved,
}: {
  eventId: string;
  userId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    if (!userId) {
      alert("Please login first");
      return;
    }

    setLoading(true);

    if (saved) {
      // ❌ REMOVE SAVE
      await supabase
        .from("saved_events")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      setSaved(false);
    } else {
      // ✅ SAVE EVENT
      await supabase.from("saved_events").insert([
        {
          event_id: eventId,
          user_id: userId,
        },
      ]);

      setSaved(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="bg-white/90 p-2 rounded-full shadow"
    >
      {saved ? (
        <SolidBookmark className="w-5 h-5 text-black" />
      ) : (
        <OutlineBookmark className="w-5 h-5 text-black" />
      )}
    </button>
  );
}