"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNotificationStore } from "@/store/notifications";
import type { User } from "@supabase/supabase-js";

type NotificationListenerProps = {
  user: User | null;
};

export default function NotificationListener({ user }: NotificationListenerProps) {
  const { refresh } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return null;
}