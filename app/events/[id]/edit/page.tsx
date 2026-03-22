import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import EditEventForm from "./EditEventForm";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !event) notFound();

  // 🔒 OWNER CHECK
  if (event.created_by !== user.id) {
    redirect("/events");
  }

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-6">
        
        {/* Back Button */}
        <Link
          href={`/events/${event.id}`}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <span className="text-lg">←</span>
        </Link>

        {/* Title */}
        <h1 className="text-xl font-semibold">Edit Event</h1>
      </div>

      {/* Form */}
      <EditEventForm event={event} />
    </div>
  );
}