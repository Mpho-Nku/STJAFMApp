import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

type Sender = {
  full_name: string | null;
  avatar_url: string | null;
};

export type NotificationItem = {
  id: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  sender: Sender;
  post_id: string | null;
};

type NotificationStore = {
  items: NotificationItem[];
  unread: number;
  userId?: string;

  fetch: (userId: string) => Promise<void>;
  refresh: () => void;
  markRead: (ids: string[]) => Promise<void>;
  setUser: (userId: string) => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  items: [],
  unread: 0,
  userId: undefined,

  fetch: async (userId) => {
    if (!userId) return;

    const { data } = await supabase
      .from("notifications")
      .select(`
        id,
        message,
        type,
        created_at,
        is_read,
        sender:profiles!notifications_sender_id_fkey(full_name, avatar_url),
        post_id
      `)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    // Normalize Supabase join (array → object)
    const items: NotificationItem[] = (data || []).map((n: any) => ({
      id: n.id,
      message: n.message,
      type: n.type,
      created_at: n.created_at,
      is_read: n.is_read,
      post_id: n.post_id,
      sender: n.sender?.[0] || {
        full_name: null,
        avatar_url: null,
      },
    }));

    const unread = items.filter((n) => !n.is_read).length;

    set({ items, unread });
  },

  refresh: () => {
    const userId = get().userId;
    if (userId) get().fetch(userId);
  },

  markRead: async (ids) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids);

    get().refresh();
  },

  setUser: (userId) => set({ userId }),
}));