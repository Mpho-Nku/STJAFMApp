'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
});

export default function CreatePostPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [location, setLocation] =
    useState<{ lat: number; lng: number } | null>(null);

  const [uploading, setUploading] = useState(false);

  /* LOAD USER */
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  if (loadingUser) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  if (!user) {
    return (
      <p className="p-6 text-center text-red-500">
        You must be signed in to create a post.
      </p>
    );
  }

  /* IMAGE */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  /* VIDEO */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setVideo(e.target.files[0]);
  };

  /* SUBMIT POST */
  const submitPost = async () => {
    if (!caption && !image && !video) {
      alert('Please add text, image, or video.');
      return;
    }

    try {
      setUploading(true);

      let imageUrl: string | null = null;
      let videoUrl: string | null = null;

      /* Upload Image */
      if (image) {
        const fileName = `${user.id}-${Date.now()}-${image.name}`;

        await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        imageUrl =
          supabase.storage
            .from('post-images')
            .getPublicUrl(fileName).data?.publicUrl ?? null;
      }

      /* Upload Video */
      if (video) {
        const fileName = `${user.id}-${Date.now()}-${video.name}`;

        await supabase.storage
          .from('post-videos')
          .upload(fileName, video);

        videoUrl =
          supabase.storage
            .from('post-videos')
            .getPublicUrl(fileName).data?.publicUrl ?? null;
      }

      /* Insert Post */
      await supabase.from('posts').insert({
        user_id: user.id,
        caption: caption.trim(),
        images: imageUrl ? [imageUrl] : [],
        video: videoUrl,
        location: location ? JSON.stringify(location) : null,
      });

      alert('✅ Post created');

      setCaption('');
      setImage(null);
      setVideo(null);
      setLocation(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-xl space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold">Create Post</h2>

      {/* Caption */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded-lg"
      />

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Video Upload */}
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
      />

      {/* Map Location Picker */}
      <MapPicker
        onLocationSelect={(lat: number, lng: number) =>
          setLocation({ lat, lng })
        }
      />

      {/* Submit Button */}
      <button
        onClick={submitPost}
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {uploading ? 'Posting…' : 'Post'}
      </button>
    </motion.div>
  );
}