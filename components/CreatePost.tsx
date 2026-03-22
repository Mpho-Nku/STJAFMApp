"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import LocationSelector from "./LocationSelector";

type LocationValue = {
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
};

type CreatePostProps = {
  onPostCreated?: () => void;
};

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [caption, setCaption] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------------------------------
     SELECT IMAGES
  --------------------------------------- */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files: File[] = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  /* ---------------------------------------
     REMOVE IMAGE
  --------------------------------------- */
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------------------------------
     SUBMIT POST
  --------------------------------------- */
  const submitPost = async () => {
    if (isSubmitting) return;

    if (!caption.trim() && selectedImages.length === 0) {
      alert("Post must contain text or images.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      /* Upload images in parallel */
      const uploadPromises = selectedImages.map(async (file, i) => {
        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${i}.${ext}`;

        const { error } = await supabase.storage
          .from("post-images")
          .upload(fileName, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(fileName);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);

      /* Insert post */
      const { error } = await supabase.from("posts").insert({
        content: caption,
        images: urls,
        location: location
          ? {
              city: location.city,
              province: location.province,
            }
          : null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        user_id: user.id,
      });

      if (error) throw error;

      /* Notify feed */
      window.dispatchEvent(new Event("post:created"));

      /* Notify parent component */
      onPostCreated?.();

      /* Reset form */
      setCaption("");
      setSelectedImages([]);
      setPreviews([]);
      setLocation(null);

    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------
     IMAGE GRID
  --------------------------------------- */
  const renderImageGrid = () => {
    if (previews.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {previews.map((preview, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square rounded-lg overflow-hidden"
          >
            <Image src={preview} alt="preview" fill className="object-cover" />

            <button
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="font-semibold text-lg mb-3">Create Post</h2>

      {/* Caption */}
      <textarea
        placeholder="What's on your mind?"
        className="w-full border rounded-xl p-3 text-sm"
        rows={3}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      {/* Add images */}
      <label className="mt-4 w-full flex items-center justify-center border border-gray-300 rounded-xl py-3 cursor-pointer hover:bg-gray-50">
        ➕ Add photos
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
      </label>

      {renderImageGrid()}

      {/* Location */}
      <div className="mt-4">
        <LocationSelector value={location} onChange={setLocation} />
      </div>

      {/* Submit */}
      <button
        onClick={submitPost}
        disabled={isSubmitting}
        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : "Post"}
      </button>
    </div>
  );
}