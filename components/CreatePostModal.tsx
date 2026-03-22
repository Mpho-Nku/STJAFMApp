'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LocationSelector from '@/components/LocationSelector';

type LocationValue = {
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function CreatePostModal() {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      alert('Please enter some text.');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('posts').insert([
        {
          user_id: user?.id,
          content,
          location: location
            ? {
                city: location.city,
                province: location.province,
              }
            : null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        },
      ]);

      if (error) throw error;

      setContent('');
      setLocation(null);

      alert('✅ Post created!');
    } catch (err) {
      console.error(err);
      alert('Error posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg w-full max-w-md mx-auto space-y-4">
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 resize-none"
        rows={3}
      />

      {/* Correct props */}
      <LocationSelector
        value={location}
        onChange={setLocation}
      />

      <button
        onClick={handlePost}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
}