"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Pencil, Trash2 } from "lucide-react";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers?: string[];
  following?: string[];
};

type Post = {
  id: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (p) setProfile(p);

      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (postData) {
        setPosts(postData);
        setMyPosts(postData);
      }
    };

    load();
  }, [id]);

  if (!profile) return <p className="p-6">Loading…</p>;

  const followerCount = profile.followers?.length || 0;
  const followingCount = profile.following?.length || 0;
  const postCount = posts.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="avatar"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold">{profile.username}</p>

            <Link href="/settings/profile">
              <Cog6ToothIcon className="w-6 h-6 text-gray-700" />
            </Link>
          </div>

          <div className="flex gap-6 mt-3">
            <div className="text-center">
              <p className="font-semibold">{postCount}</p>
              <p className="text-sm text-gray-500">posts</p>
            </div>

            <div className="text-center">
              <p className="font-semibold">{followerCount}</p>
              <p className="text-sm text-gray-500">followers</p>
            </div>

            <div className="text-center">
              <p className="font-semibold">{followingCount}</p>
              <p className="text-sm text-gray-500">following</p>
            </div>
          </div>
        </div>
      </div>

      {/* NAME + BIO */}
      <div className="mt-4">
        <p className="font-semibold">{profile.full_name}</p>
        <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
      </div>

      {/* EDIT PROFILE BUTTON */}
      <div className="mt-6">
        <Link
          href="/settings/profile"
          className="block text-center w-full py-2 bg-gray-200 rounded-lg"
        >
          Edit Profile
        </Link>
      </div>

      {/* POSTS GRID */}
      <div className="grid grid-cols-3 gap-1 mt-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <div className="relative aspect-square bg-gray-200">
              <Image
                src={post.image_url || "/placeholder.png"}
                alt="post"
                fill
                className="object-cover"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* MY POSTS MANAGER */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">My Posts</h2>

        {myPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You haven't created any posts yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {myPosts.map((p) => (
              <div
                key={p.id}
                className="relative group border rounded-lg shadow overflow-hidden"
              >
                <Link href={`/post/${p.id}`}>
                  <Image
                    src={p.image_url || "/placeholder.png"}
                    alt="post"
                    width={500}
                    height={500}
                    className="object-cover w-full h-40"
                  />
                </Link>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-5 transition">

                  <Link
                    href={`/post/${p.id}/edit`}
                    className="text-white hover:text-blue-300"
                  >
                    <Pencil size={22} />
                  </Link>

                  <button
                    className="text-white hover:text-red-300"
                    onClick={async () => {
                      if (!confirm("Delete this post?")) return;

                      await supabase
                        .from("posts")
                        .delete()
                        .eq("id", p.id);

                      setMyPosts((prev) =>
                        prev.filter((x) => x.id !== p.id)
                      );
                    }}
                  >
                    <Trash2 size={22} />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}