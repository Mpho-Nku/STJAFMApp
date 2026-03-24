"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SuccessModal from "@/components/SuccessModal";

type Props = {
  event: any;
};

export default function EditEventForm({ event }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [startTime, setStartTime] = useState(event.start_time || "");
  const [endTime, setEndTime] = useState(event.end_time || "");

  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("events")
        .update({
          title,
          description,
          start_time: startTime,
          end_time: endTime,
        })
        .eq("id", event.id);

      if (error) {
        console.error(error);
        alert("Something went wrong while updating the event.");
        return;
      }

      // ✅ SUCCESS (NO MORE alert)
      if (!error) {
  setSuccessOpen(true);

  // ✅ Auto redirect after 1.5s
  setTimeout(() => {
    router.push(`/events/${event.id}`);
  }, 1500);
}

    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FORM */}
      <div className="space-y-4">
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full border rounded-lg px-4 py-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Event"}
        </button>
      </div>

      {/* ✅ SUCCESS MODAL */}
      <SuccessModal
        isOpen={successOpen}
        message="Event updated successfully"
        onClose={() => {
          setSuccessOpen(false);
          router.push(`/events`);
        }}
      />
    </>
  );
}