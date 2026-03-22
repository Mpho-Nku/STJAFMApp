'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export default function CommentsThread({
  postId,
  user,
}: {
  postId: string;
  user: { id: string } | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    setComments((data as Comment[]) || []);
  };

  useEffect(() => {
    loadComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const postComment = async () => {
    if (!newComment.trim() || !user) return;

    await supabase.from('post_comments').insert([
      {
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        parent_id: replyTo || null,
      },
    ]);

    setNewComment('');
    setReplyTo(null);
  };

  const renderComments = (parentId: string | null = null, level = 0) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .map((c) => (
        <div key={c.id} className="mt-2" style={{ marginLeft: level * 16 }}>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300" />

            <div>
              <p className="text-sm font-semibold">
                {c.profiles?.full_name || 'User'}
              </p>

              <p className="text-sm text-gray-700">{c.content}</p>

              <button
                onClick={() => setReplyTo(c.id)}
                className="text-xs text-blue-600 mt-1"
              >
                Reply
              </button>
            </div>
          </div>

          {renderComments(c.id, level + 1)}
        </div>
      ));

  return (
    <div className="mt-4">
      {renderComments()}

      <div className="flex items-center mt-3 gap-2">
        <input
          type="text"
          placeholder={replyTo ? 'Reply...' : 'Add a comment...'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-1 text-sm"
        />

        <button
          onClick={postComment}
          className="text-blue-600 font-medium hover:underline"
        >
          Post
        </button>
      </div>
    </div>
  );
}