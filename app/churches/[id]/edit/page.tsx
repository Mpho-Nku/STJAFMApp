"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditChurch() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const churchId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
    pastor_name: "",
    image_url: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);

  // 🔍 Fetch church + check ownership
  useEffect(() => {
    const fetchChurch = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", churchId)
        .single();

      if (error || !data) {
        setError("Church not found");
        setLoading(false);
        return;
      }

      // 🚨 Ownership check
      if (data.created_by !== user.id) {
        setError("You are not allowed to edit this church");
        setLoading(false);
        return;
      }

      setFormData({
        name: data.name || "",
        location: data.location || "",
        type: data.type || "",
        description: data.description || "",
        pastor_name: data.pastor_name || "",
        image_url: data.image_url || "",
      });

      setLoading(false);
    };

    if (churchId) fetchChurch();
  }, [churchId, supabase, router]);

  // 💾 Handle Update
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Not authenticated");
        return;
      }

      let imageUrl = formData.image_url;

      // ✅ Upload new image if changed
      if (newImage) {
        const fileExt = newImage.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("church-images")
          .upload(fileName, newImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("church-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // ✅ Update DB
      const { error } = await supabase
        .from("churches")
        .update({
          name: formData.name,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          pastor_name: formData.pastor_name,
          image_url: imageUrl,
        })
        .eq("id", churchId);

      if (error) throw error;

      router.push(`/churches/${churchId}`);
    } catch (err: any) {
      console.error("UPDATE ERROR:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ⏳ Loading
  if (loading) return <p className="p-6">Loading...</p>;

  // 🚨 Unauthorized / Error
  if (error)
    return (
      <p className="p-6 text-red-500 font-semibold">
        {error}
      </p>
    );

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Church</h1>

      <div className="space-y-4">
        <input
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Church Name"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          value={formData.pastor_name}
          onChange={(e) =>
            setFormData({ ...formData, pastor_name: e.target.value })
          }
          placeholder="Pastor Name"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Location"
          className="w-full border px-3 py-2 rounded"
        />

        <input
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value })
          }
          placeholder="Type"
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />

        {/* Current Image */}
        {formData.image_url && (
          <img
            src={formData.image_url}
            className="w-40 rounded"
            alt="Church"
          />
        )}

        {/* Upload New */}
        <input
          type="file"
          onChange={(e) => setNewImage(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}