"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Heart } from "lucide-react";

type CommentLikeButtonProps = {
  commentId: string;
  user: {
    id: string;
  } | null;
};

export default function CommentLikeButton({
  commentId,
  user,
}: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const loadLikes = async () => {
    if (!user) return;

    const { data: likedRow } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    setLiked(!!likedRow);

    const { count: total } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    setCount(total || 0);
  };

  useEffect(() => {
    loadLikes();

    const channel = supabase
      .channel(`comment-likes-${commentId}`)
      .on(
        "postgres_changes",
        { event: "*", table: "comment_likes", schema: "public" },
        loadLikes
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentId]);

  const toggle = async () => {
    if (!user) return;

    if (liked) {
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);

      setLiked(false);
      setCount((c) => c - 1);
    } else {
      await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: user.id,
      });

      setLiked(true);
      setCount((c) => c + 1);

      if (navigator?.vibrate) navigator.vibrate(10);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-xs text-gray-600"
    >
      <Heart
        size={16}
        className={liked ? "fill-red-500 stroke-red-500" : "stroke-gray-600"}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}