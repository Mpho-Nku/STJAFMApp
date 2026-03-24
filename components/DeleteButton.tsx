"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteEventButton({
  eventId,
  userId,
}: {
  eventId: string;
  userId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!userId) {
      alert("Please login first");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("created_by", userId); // 🔒 owner check

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to delete event");
      return;
    }

    router.replace("/events");
  };

  return (
    <>
      {/* 🔥 DELETE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-black text-white transition text-sm"
      >
        <TrashIcon className="w-4 h-4" />
        Delete
      </button>

      {/* 🔥 CONFIRM MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-80 shadow-lg text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="font-semibold mb-2">
                Delete Event?
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 border rounded-lg py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}