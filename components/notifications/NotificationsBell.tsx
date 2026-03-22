"use client";

import { useNotificationStore } from "@/store/notifications";

export default function NotificationsDropdown() {
  const { items } = useNotificationStore();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
      {items.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No notifications</p>
      ) : (
        items.map((n) => (
          <div key={n.id} className="p-3 border-b hover:bg-gray-50">
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-400">{n.created_at}</p>
          </div>
        ))
      )}
    </div>
  );
}