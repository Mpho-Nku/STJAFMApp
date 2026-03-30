"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  event_id: string;
  is_read: boolean;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  /* =========================
     LOAD NOTIFICATIONS
  ========================== */
  const loadNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);

    // 🔥 mark all as read
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  /* =========================
     REAL-TIME UPDATES
  ========================== */
  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as Notification,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <h1 className="text-2xl font-bold mb-6">
        Notifications
      </h1>

      {notifications.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No notifications yet
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => router.push(`/events/${n.event_id}`)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              n.is_read
                ? "bg-white"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-gray-500">
              {n.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}