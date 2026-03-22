"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

type PostReactionsProps = {
  postId: string;
  user: { id: string } | null;
  onComment?: () => void;
};

export default function PostActions({
  postId,
  user,
  onComment,
}: PostReactionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="flex items-center gap-1"
      >
        <Heart size={20} />
        <span className="text-sm">{likesCount}</span>
      </button>

      <button onClick={onComment}>
        <MessageCircle size={20} />
      </button>

      <button>
        <Bookmark size={20} />
      </button>
    </div>
  );
}