import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function main() {
  const today = new Date();

  const { data } = await supabase
    .from("saved_events")
    .select(`
      user_id,
      remind_days_before,
      events (
        id,
        title,
        start_time,
        updated_at
      ),
      event_reminders (
        last_notified_at
      )
    `);

for (const row of data ?? []) {
  const event = row.events?.[0];
  if (!event) continue;

  const remindDate = new Date(event.start_time);

  remindDate.setDate(
    remindDate.getDate() - (row.remind_days_before ?? 1)
  );

  const last = row.event_reminders?.[0]?.last_notified_at;

  const shouldNotify =
    today >= remindDate &&
    (!last || new Date(event.updated_at) > new Date(last));

  if (!shouldNotify) continue;

  await supabase.from("notifications").insert({
    user_id: row.user_id,
    title: "Event Reminder",
    message: `Reminder for ${event.title}`,
  });

  await supabase.from("event_reminders").upsert({
    user_id: row.user_id,
    event_id: event.id,
    last_notified_at: new Date().toISOString(),
  });
}
}