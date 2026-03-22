"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Bookmark } from "lucide-react";

import { useRouter } from "next/navigation";
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
const router = useRouter();

  // Temp edit fields
  const [editData, setEditData] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });
type Profile = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  church_id?: string | null;
  // add other fields you use
};
  // ---------------------------------------------------------
  // LOAD DASHBOARD
  // ---------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data.user;
      setUser(authUser);

      if (!authUser) {
        setLoading(false);
        return;
      }

      // Load profile
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setProfile(p);

      setEditData({
        full_name: p?.full_name || "",
        phone: p?.phone || "",
        bio: p?.bio || "",
      });

      // Load my posts
      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      setMyPosts(posts || []);

      // Load saved
      const { data: saved } = await supabase
        .from("saved_posts")
        .select("post_id, posts(*)")
        .eq("user_id", authUser.id);

      setSavedPosts(saved?.map((s) => s.posts) || []);

      setLoading(false);
    };

    load();
  }, []);

  // ---------------------------------------------------------
  // SAVE PROFILE CHANGES
  // ---------------------------------------------------------
  const saveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editData.full_name,
        phone: editData.phone,
        bio: editData.bio,
      })
      .eq("id", user.id);

    if (!error) {
      setProfile((prev: Profile | null) => ({ ...prev, ...editData }));
    } else {
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  if (!user)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">You must be logged in to view the dashboard.</p>
        <Link href="/auth" className="btn btn-primary mt-3">Login</Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

      {/* -----------------------------------------------------
         PROFILE HEADER
      ------------------------------------------------------ */}
      <section className="p-6 bg-white border rounded-xl shadow space-y-5">

        <div className="flex items-center gap-5">
          {/* Avatar */}
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.[0] || "U"}
            </div>
          )}

          <div className="flex-grow">
            <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <button
            className="btn text-sm btn-primary"
            onClick={() => setEditingProfile(true)}
          >
            Edit Profile
          </button>
        </div>

        {/* Church */}
        <p className="text-sm text-gray-700">
          <strong>Church:</strong> {profile?.church_name || "Not selected"}
        </p>

        {/* Phone */}
        <p className="text-sm text-gray-700">
          <strong>Phone:</strong> {profile?.phone || "Not added"}
        </p>

        {/* Bio */}
        {profile?.bio && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            <strong>Bio:</strong> {profile.bio}
          </p>
        )}
      </section>

      {/* -----------------------------------------------------
         EDIT PROFILE MODAL
      ------------------------------------------------------ */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">
            <h3 className="text-lg font-bold">Edit Profile</h3>

            <input
              className="input"
              placeholder="Full Name"
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
            />

            <input
              className="input"
              placeholder="Phone Number"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <textarea
              className="input h-24"
              placeholder="Bio"
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            />

            <div className="flex gap-3">
              <button
                className="btn w-full"
                onClick={() => setEditingProfile(false)}
              >
                Cancel
              </button>

              <button
                className="btn-primary w-full"
                onClick={saveProfile}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------
         MY POSTS
      ------------------------------------------------------ */}
      <section>
        <h2 className="text-xl font-bold mb-3">My Posts</h2>

        {myPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven't created any posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {myPosts.map((p) => (
              <div key={p.id} className="relative group border rounded-lg shadow overflow-hidden">
                <Link href={`/post/${p.id}`}>
                  <Image
                    src={p.images?.[0] || "/placeholder.jpg"}
                    alt="post"
                    width={500}
                    height={500}
                    className="object-cover w-full h-40"
                  />
                </Link>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-5 transition">
                  <Link href={`/post/${p.id}/edit`} className="text-white hover:text-blue-300">
                    <Pencil size={22} />
                  </Link>

                  <button
                    className="text-white hover:text-red-300"
                    onClick={async () => {
                      if (!confirm("Delete this post?")) return;
                      await supabase.from("posts").delete().eq("id", p.id);
                      setMyPosts((prev) => prev.filter((x) => x.id !== p.id));
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

      {/* -----------------------------------------------------
         SAVED POSTS
      ------------------------------------------------------ */}
      <section>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          Saved Posts
        </h2>

        {savedPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved posts.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {savedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="border rounded-lg overflow-hidden shadow"
              >
                <Image
                  src={post.images?.[0] || "/placeholder.jpg"}
                  alt="saved post"
                  width={500}
                  height={500}
                  className="object-cover w-full h-40"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
