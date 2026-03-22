"use client";
import { useNotificationStore } from "@/store/notifications";
import Image from "next/image";
import Link from "next/link";

export default function NotificationsDropdown() {
  const { items } = useNotificationStore();

  return (
    <div className="absolute top-12 right-0 bg-white shadow-lg w-80 rounded-xl p-3">
      {items.length === 0 && (
        <p className="text-center text-gray-500 py-4">No notifications</p>
      )}

      {items.map((n) => (
        <Link
          key={n.id}
          href={`/post/${n.post_id}`}
          className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg"
        >
        <Image
  src={n.sender?.avatar_url || "/avatar.png"}
  width={40}
  height={40}
  alt="avatar"
  className="rounded-full"
/>

          <div>
          <p className="text-sm">
  <span className="font-semibold">
    {n.sender?.full_name || "User"}
  </span>{" "}
  {n.message}
</p>
            <p className="text-xs text-gray-500">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
