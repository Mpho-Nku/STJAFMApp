"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Post = {
  id: string;
};

type User = {
  id: string;
};

type CommentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  user: User | null;
};

export default function CommentModal({
  isOpen,
  onClose,
  post,
  user,
}: CommentModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl w-full max-w-lg p-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Comments</h2>

              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>

            {/* COMMENTS LIST */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  {c.content}
                </div>
              ))}
            </div>

            {/* COMMENT INPUT */}
            {user && (
              <div className="mt-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Write a comment..."
                />

                <button className="bg-blue-600 text-white px-4 rounded-lg">
                  Post
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}