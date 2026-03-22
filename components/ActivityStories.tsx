"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type: string;
  message: string | null;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  post_id: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  }[];
};

export default function ActivityStories() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data } = await supabase
      .from("notifications")
      .select(
        `
        id,
        type,
        message,
        created_at,
        read_at,
        sender_id,
        post_id,
        profiles:sender_id ( full_name, avatar_url )
      `
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    setItems(data || []);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("activity-stories")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newItem = payload.new as NotificationItem;

          setItems((prev) => {
            if (prev.find((x) => x.id === newItem.id)) return prev;
            return [newItem, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full overflow-x-auto border-b py-3 bg-white">
      <div className="flex gap-4 px-4">
        {items.slice(0, 20).map((n) => (
          <button
            key={n.id}
            onClick={() => {
              if (n.post_id) router.push(`/post/${n.post_id}`);
            }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <Image
                src={n.profiles?.[0]?.avatar_url || "/avatar.png"}
                width={60}
                height={60}
                className={`rounded-full border-2 ${
                  n.read_at ? "border-gray-300" : "border-blue-500"
                }`}
                alt="avatar"
              />
            </div>

            <p className="text-[11px] mt-1 text-gray-700 whitespace-nowrap">
              {n.profiles?.[0]?.full_name?.split(" ")[0] || "User"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}