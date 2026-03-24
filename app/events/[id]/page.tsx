import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EventDetailsClient from "./EventDetailsClient";
import Link from "next/link";

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  /* ---------------- AUTH ---------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ---------------- EVENT ---------------- */
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      description,
      start_time,
      end_time,
      created_by,
      churches (
        id,
        name,
        location,
        image_url,
        pastor_name
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (eventError || !event) notFound();

  const isOwner = user?.id === event.created_by;

  /* ---------------- SAVE STATE ---------------- */
  let isSaved = false;
  let reminderDays: number | null = null;

  if (user) {
    const { data: saved } = await supabase
      .from("saved_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .maybeSingle();

    isSaved = !!saved;

    const { data: reminder } = await supabase
      .from("event_reminders")
      .select("days_before")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .maybeSingle();

    reminderDays = reminder?.days_before ?? null;
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* 🔙 BACK BUTTON */}
      <Link
        href="/events"
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
      >
        <span className="text-lg">←</span>
        Back to Events
      </Link>

      {/* PAGE CONTENT */}
      <EventDetailsClient
        event={event}
        isOwner={isOwner}
        isSaved={isSaved}
        reminderDays={reminderDays}
        user={user}
      />
    </div>
  );
}