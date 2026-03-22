"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CommentLikeButton from "./CommentLikeButton";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type CommentProfile = {
  full_name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: CommentProfile | null;
  replies?: Comment[];
};

type CommentItemProps = {
  c: Comment;
  user: any;
  onReply: (comment: Comment) => void;
  onRefresh: () => void;
  level?: number;
};

export default function CommentItem({
  c,
  user,
  onReply,
  onRefresh,
  level = 0,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.content);
  const [showReplies, setShowReplies] = useState(true);

  // -------------------------------------------
  // SAVE EDIT
  // -------------------------------------------
  const saveEdit = async () => {
    if (!text.trim()) return;

    await supabase
      .from("post_comments")
      .update({ content: text.trim() })
      .eq("id", c.id);

    setEditing(false);
    onRefresh();
  };

  // -------------------------------------------
  // DELETE COMMENT
  // -------------------------------------------
  const remove = async () => {
    if (!confirm("Delete comment?")) return;

    await supabase.from("post_comments").delete().eq("id", c.id);

    onRefresh();
  };

  return (
    <div className="mt-3" style={{ marginLeft: level * 22 }}>
      <div className="flex items-start gap-3">
        {/* AVATAR */}
        {c.profiles?.avatar_url ? (
          <img
            src={c.profiles.avatar_url}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-semibold">
            {c.profiles?.full_name?.[0] || "U"}
          </div>
        )}

        <div className="flex-1">
          {/* BUBBLE */}
          <div className="bg-gray-100 px-3 py-2 rounded-2xl">
            {/* USERNAME */}
            <p className="font-semibold text-[13px] text-gray-900">
              {c.profiles?.full_name}
            </p>

            {/* CONTENT */}
            {editing ? (
              <>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <div className="flex gap-3 mt-2 text-xs">
                  <button className="text-blue-600" onClick={saveEdit}>
                    Save
                  </button>

                  <button
                    className="text-gray-600"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="text-[14px] text-gray-800 whitespace-pre-wrap leading-snug">
                {c.content}
              </p>
            )}
          </div>

          {/* META ACTIONS */}
          <div className="flex items-center gap-4 mt-1 text-[12px] text-gray-600">
            <span>{new Date(c.created_at).toLocaleString()}</span>

            <button
              className="hover:text-blue-600"
              onClick={() => onReply(c)}
            >
              Reply
            </button>

            <CommentLikeButton commentId={c.id} user={user} />

            {user?.id === c.user_id && !editing && (
              <>
                <button
                  className="flex items-center gap-1 text-blue-600"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={12} />
                  Edit
                </button>

                <button
                  className="flex items-center gap-1 text-red-600"
                  onClick={remove}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* REPLIES */}
          {c.replies?.length ? (
            <div className="mt-1 ml-2">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[12px] text-gray-500 hover:underline"
              >
                {showReplies
                  ? `Hide replies (${c.replies.length})`
                  : `View replies (${c.replies.length})`}
              </button>

              {showReplies && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  {c.replies.map((r) => (
                    <CommentItem
                      key={r.id}
                      c={r}
                      user={user}
                      onReply={onReply}
                      onRefresh={onRefresh}
                      level={level + 1}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}