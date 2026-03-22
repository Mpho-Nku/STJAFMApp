"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Components
import PostReactions from "@/components/PostReactions";
import CommentModal from "@/components/CommentModal";
import PostOptionsMenu from "@/components/PostOptionsMenu";
import EditPostModal from "@/components/EditPostModal";
import FloatingNewPostButton from "@/components/FloatingNewPostButton";
import PostCarousel from "@/components/PostCarousel";

import { deletePostWithMedia } from "@/lib/deletePost";

export default function Feed() {
  const router = useRouter();

  useEffect(() => {
    const enforce = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      /* FIXED PROFILE CHECK */

      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.church_id) {
        router.push("/onboarding/church");
        return;
      }

      /* EVENT CHECK */

      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id);

      if (count === 0) {
        router.push("/onboarding/events");
        return;
      }
    };

    enforce();
  }, [router]);

  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [optionsPost, setOptionsPost] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // --------------------------------------------------------------------
  // LOAD FEED
  // --------------------------------------------------------------------
  const loadFeed = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          user_id,
          content,
          images,
          location_name,
          created_at,
          profiles (full_name, avatar_url)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsData = data || [];

      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          const { count } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)
            .eq("parent_id", null);

          return { ...post, comment_count: count || 0 };
        })
      );

      setPosts(postsWithCounts);
    } catch (err) {
      console.error("Feed load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------
  useEffect(() => {
    loadFeed();

    const refresh = () => loadFeed();
    window.addEventListener("post:created", refresh);

    const channel = supabase
      .channel("feed-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_comments" },
        refresh
      )
      .subscribe();

    return () => {
      window.removeEventListener("post:created", refresh);
      supabase.removeChannel(channel);
    };
  }, []);

  // --------------------------------------------------------------------
  // COMMENT MODAL HANDLERS
  // --------------------------------------------------------------------
  const openComments = (post: any) => {
    setSelectedPost(post);
    setCommentsOpen(true);
  };

  const closeComments = () => {
    setCommentsOpen(false);
    setTimeout(() => setSelectedPost(null), 200);
  };

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading feed…
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-32 px-3">

      {user && <FloatingNewPostButton />}

      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center gap-3 p-4">

            {post.profiles?.avatar_url ? (
              <Image
                src={post.profiles.avatar_url}
                alt="avatar"
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                {post.profiles?.full_name?.[0] || "U"}
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {post.profiles?.full_name}
              </p>

              {post.location_name && (
                <p className="text-xs text-gray-500">
                  {post.location_name}
                </p>
              )}
            </div>

            {user?.id === post.user_id && (
              <button
                onClick={() => {
                  setOptionsPost(post);
                  setShowOptions(true);
                }}
                className="ml-auto text-2xl text-gray-600"
              >
                ⋯
              </button>
            )}
          </div>

          {post.content && (
            <p className="px-4 pb-2 text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          )}

          {post.images?.length > 0 && (
            <PostCarousel images={post.images} />
          )}

          <div className="px-4 py-3 border-t">
            <PostReactions
              postId={post.id}
              user={user}
              onComment={() => openComments(post)}
            />
          </div>

          {post.comment_count > 0 && (
            <button
              onClick={() => openComments(post)}
              className="text-gray-600 text-sm px-4 pb-3"
            >
              View all {post.comment_count} comments
            </button>
          )}
        </div>
      ))}

      {selectedPost && (
        <CommentModal
          isOpen={isCommentsOpen}
          onClose={closeComments}
          post={selectedPost}
          user={user}
        />
      )}

      {showOptions && optionsPost && (
        <PostOptionsMenu
          canEdit={user?.id === optionsPost.user_id}
          onClose={() => setShowOptions(false)}
          onDelete={async () => {
            const confirmDel = confirm("Delete this post?");
            if (!confirmDel) return;

            await deletePostWithMedia(optionsPost);
            setShowOptions(false);
            window.dispatchEvent(new Event("post:created"));
          }}
          onEdit={() => {
            setEditingPost(optionsPost);
            setIsEditing(true);
            setShowOptions(false);
          }}
        />
      )}

      {isEditing && editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onUpdated={() =>
            window.dispatchEvent(new Event("post:created"))
          }
        />
      )}
    </div>
  );
}