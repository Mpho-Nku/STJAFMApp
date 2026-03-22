"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function EventOnboarding() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [church, setChurch] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (!profile?.church_id) {
        router.push("/onboarding/church");
        return;
      }

      setChurch(profile.church_id);
    };

    load();
  }, [router]);

  const saveEvent = async () => {
    if (!title.trim() || !user || !church) return;

    await supabase.from("events").insert({
      title,
      church_id: church,
      created_by: user.id,
    });

    router.push("/onboarding/done");
  };

  return (
    <div className="p-5 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Add an event for your church
      </h1>

      <input
        className="w-full p-3 border rounded-lg mb-3"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        onClick={saveEvent}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
      >
        Save Event
      </button>
    </div>
  );
}