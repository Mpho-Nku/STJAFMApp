"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessModal from "@/components/ui/SuccessModal";
import {
  MapPinIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function AddEventClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const churchId = searchParams.get("churchId");

  const [churchQuery, setChurchQuery] = useState("");
  const [churchResults, setChurchResults] = useState<any[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* AUTO-SELECT AFTER CREATE */
  useEffect(() => {
    if (!churchId) return;

    const loadChurch = async () => {
      const { data } = await supabase
        .from("churches")
        .select("id, name, location")
        .eq("id", churchId)
        .single();

      if (data) {
        setSelectedChurch(data);
        setChurchQuery(data.name);
      }
    };

    loadChurch();
  }, [churchId]);

  /* SEARCH */
  useEffect(() => {
    if (!churchQuery.trim()) {
      setChurchResults([]);
      return;
    }

    const search = async () => {
      const { data } = await supabase
        .from("churches")
        .select("id, name, location")
        .ilike("name", `%${churchQuery}%`)
        .limit(5);

      setChurchResults(data || []);
    };

    search();
  }, [churchQuery]);

  const getEndDate = (start: string) => {
    const d = new Date(start);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleCreateEvent = async () => {
    if (!selectedChurch) return alert("Select a church first");
    if (!title || !startDate) return alert("Fill required fields");

    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const start = new Date(startDate);
    const end = new Date(getEndDate(startDate));

    const { error } = await supabase.from("events").insert({
      church_id: selectedChurch.id,
      title,
      description,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      created_by: user.id,
    });

    setCreating(false);

    if (error) return alert("Failed to create event");

    setShowSuccess(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-md px-4 py-6">

          {/* BACK */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>

          {/* CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">

            <h1 className="text-lg font-semibold text-gray-900">
              Add Event
            </h1>

            {/* ---------------- CHURCH SEARCH ---------------- */}
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-600">
                Select Church *
              </label>

              <div className="relative">
                <MapPinIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />

                <input
                  value={churchQuery}
                  onChange={(e) => {
                    setChurchQuery(e.target.value);
                    setSelectedChurch(null);
                  }}
                  placeholder="Search church..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              {/* DROPDOWN */}
              {!selectedChurch && churchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-md z-50 max-h-60 overflow-y-auto">

                  {churchResults.map((ch) => (
                    <div
                      key={ch.id}
                      onMouseDown={() => {
                        setSelectedChurch(ch);
                        setChurchQuery(ch.name);
                        setChurchResults([]);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {ch.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ch.location}
                      </p>
                    </div>
                  ))}

                  {churchResults.length === 0 && (
                    <div className="px-4 py-3 border-t">
                      <p className="text-xs text-gray-400 mb-1">
                        No church found
                      </p>

                      <button
                        onMouseDown={() =>
                          router.push(
                            `/onboarding/church/add?name=${encodeURIComponent(
                              churchQuery
                            )}&redirectTo=/events/add`
                          )
                        }
                        className="text-sm text-blue-600 font-medium"
                      >
                        + Create "{churchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SELECTED */}
              {selectedChurch && (
                <div className="p-3 bg-blue-50 rounded-xl text-sm">
                  Selected:{" "}
                  <span className="font-medium">
                    {selectedChurch.name}
                  </span>
                </div>
              )}
            </div>

            {/* ---------------- FORM ---------------- */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />

            {/* BUTTON */}
            <button
              disabled={!selectedChurch || creating}
              onClick={handleCreateEvent}
              className="w-full h-12 bg-black text-white rounded-xl font-medium shadow-sm hover:bg-dark-700 transition"
            >
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS */}
      <SuccessModal
        open={showSuccess}
        message="Your event has been successfully created."
        primaryText="Go to Events"
        onPrimary={() => {
          setShowSuccess(false);
          router.replace("/events");
        }}
      />
    </>
  );
}