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

  if (event.created_by !== user.id) {
    redirect("/events");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md px-4 py-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/events/${event.id}`}
            className="text-gray-600 text-sm"
          >
            ← Back
          </Link>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* TITLE */}
          <h1 className="text-lg font-semibold text-gray-900 mb-4">
            Edit Event
          </h1>

          {/* FORM */}
          <EditEventForm event={event} />

        </div>
      </div>
    </div>
  );
}