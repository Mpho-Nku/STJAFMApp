'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/solid';

interface FeedItem {
  id: string;
  type: 'event' | 'devotional' | 'announcement';
  title: string;
  description?: string | null;
  date?: string | null;
  church_id?: string | null;
}

export default function PersonalizedFeed() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {

      /* ---------- GET USER ---------- */

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      /* ---------- GET PROFILE ---------- */

      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('id', currentUser.id)
        .maybeSingle();

      // ✅ Safe null check (fixes your TypeScript error)
      if (!profile?.church_id) {
        router.push('/onboarding/church');
        setLoading(false);
        return;
      }

      /* ---------- FETCH FEED DATA ---------- */

      const [eventsRes, devotionalsRes, announcementsRes] = await Promise.all([
        supabase
          .from('events')
          .select('id,title,description,start_time,church_id')
          .order('start_time', { ascending: true })
          .limit(5),

        supabase
          .from('devotionals')
          .select('id,title,description,created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('announcements')
          .select('id,title,description,created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const items: FeedItem[] = [];

      /* ---------- MAP EVENTS ---------- */

      eventsRes.data?.forEach((ev: any) =>
        items.push({
          id: ev.id,
          type: 'event',
          title: ev.title,
          description: ev.description,
          date: ev.start_time,
          church_id: ev.church_id,
        })
      );

      /* ---------- MAP DEVOTIONALS ---------- */

      devotionalsRes.data?.forEach((dev: any) =>
        items.push({
          id: dev.id,
          type: 'devotional',
          title: dev.title,
          description: dev.description,
          date: dev.created_at,
        })
      );

      /* ---------- MAP ANNOUNCEMENTS ---------- */

      announcementsRes.data?.forEach((an: any) =>
        items.push({
          id: an.id,
          type: 'announcement',
          title: an.title,
          description: an.description,
          date: an.created_at,
        })
      );

      /* ---------- SORT FEED ---------- */

      items.sort(
        (a, b) =>
          new Date(b.date ?? '').getTime() -
          new Date(a.date ?? '').getTime()
      );

      setFeed(items);
      setLoading(false);
    };

    loadFeed();
  }, [router]);

  /* ---------- STATES ---------- */

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        Please sign in to see your feed.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading your feed...
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">

      <h1 className="text-2xl font-bold text-blue-900">
        Your Personalized Feed
      </h1>

      {feed.length === 0 && (
        <p className="text-gray-500">
          No updates yet. Check back soon!
        </p>
      )}

      {feed.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg shadow-md bg-white border border-gray-200 hover:shadow-lg transition"
        >

          {/* TYPE + ICON */}

          <div className="flex items-center gap-2 mb-2 text-sm text-blue-700">
            {item.type === 'event' && <CalendarIcon className="h-5 w-5" />}
            {item.type === 'devotional' && <BookOpenIcon className="h-5 w-5" />}
            {item.type === 'announcement' && <BellIcon className="h-5 w-5" />}
            <span className="capitalize">{item.type}</span>
          </div>

          {/* TITLE */}

          <h2 className="font-semibold text-lg">{item.title}</h2>

          {/* DESCRIPTION */}

          {item.description && (
            <p className="text-sm text-gray-600 mt-1">
              {item.description}
            </p>
          )}

          {/* DATE */}

          {item.date && (
            <p className="text-xs text-gray-400 mt-2">
              {new Date(item.date).toLocaleString()}
            </p>
          )}

          {/* LINK */}

          {item.type === 'event' && item.church_id && (
            <Link
              href={`/churches/${item.church_id}`}
              className="text-sm text-blue-600 mt-2 inline-block hover:underline"
            >
              View Church →
            </Link>
          )}

        </div>
      ))}
    </div>
  );
}