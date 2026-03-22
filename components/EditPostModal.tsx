"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

type EditPostModalProps = {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function EditPostModal({
  post,
  isOpen,
  onClose,
  onUpdated,
}: EditPostModalProps) {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setLocation(post.location_name || "");
      setImages(post.images || []);
    }
  }, [post]);

  if (!isOpen) return null;

  /* REMOVE EXISTING IMAGE */
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ADD NEW IMAGES */
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files: File[] = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
  };

  /* UPLOAD NEW IMAGES */
  const uploadNewImages = async (): Promise<string[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const uploadedUrls: string[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  /* SAVE UPDATED POST */
  const updatePost = async () => {
    setSaving(true);

    const newImageUrls = await uploadNewImages();
    const finalImages = [...images, ...newImageUrls];

    const { error } = await supabase
      .from("posts")
      .update({
        content,
        location_name: location,
        images: finalImages,
      })
      .eq("id", post.id);

    setSaving(false);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update post.");
      return;
    }

    window.dispatchEvent(new Event("post:created"));
    if (onUpdated) onUpdated();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div
          className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-xl mx-auto overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <button onClick={onClose} className="text-gray-500 text-[15px]">
              Cancel
            </button>

            <p className="font-semibold text-gray-900 text-[16px]">
              Edit Post
            </p>

            <button
              disabled={saving}
              onClick={updatePost}
              className="text-blue-600 font-semibold text-[15px] disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {/* BODY */}
          <div className="px-5 py-5 space-y-5">
            {/* CAPTION */}
            <div>
              <p className="text-[13px] text-gray-500 uppercase mb-2">
                Caption
              </p>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border p-3 text-[15px]"
              />
            </div>

            {/* LOCATION */}
            <div>
              <p className="text-[13px] text-gray-500 uppercase mb-2">
                Location
              </p>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border p-3 text-[15px]"
                placeholder="Add location"
              />
            </div>

            {/* IMAGES */}
            <div>
              <p className="text-[13px] text-gray-500 uppercase mb-2">
                Images
              </p>

              {/* EXISTING IMAGES */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <Image
                      src={img}
                      alt=""
                      width={300}
                      height={300}
                      className="rounded-xl object-cover aspect-square"
                    />

                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD NEW IMAGES */}
              <label className="flex items-center justify-center border border-dashed border-gray-400 rounded-xl py-4 cursor-pointer">
                <div className="flex flex-col items-center text-gray-600">
                  <Plus size={24} />
                  <span className="text-sm mt-1">Add Images</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddImages}
                />
              </label>

              {/* NEW IMAGE PREVIEW */}
              {newFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {newFiles.map((file, i) => (
                    <div key={i}>
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="new"
                        width={300}
                        height={300}
                        className="rounded-xl object-cover aspect-square"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}