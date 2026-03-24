"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DeleteChurchModal from "@/components/DeleteChurchModal";

export default function ChurchesPage() {
  const router = useRouter();

  const [churches, setChurches] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ✅ NEW STATE
  const [showDelete, setShowDelete] = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [selectedChurchName, setSelectedChurchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data } = await supabase
        .from("churches")
        .select("*")
        .order("name");

      setChurches(data || []);
    };

    load();
  }, []);

  const filtered = churches.filter((ch) =>
    [ch.name, ch.pastor_name, ch.location]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const showEmptyState = query.length > 2 && filtered.length === 0;

  const handleAddChurch = () => {
    router.push(
      `/onboarding/church/add?name=${encodeURIComponent(query)}`
    );
  };

  // ✅ UPDATED DELETE HANDLER
  const handleDelete = async () => {
    if (!selectedChurchId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("churches")
        .delete()
        .eq("id", selectedChurchId)
        .eq("created_by", userId); // 🔒 secure

      if (error) {
        alert("You are not allowed to delete this church");
        return;
      }

      setChurches((prev) =>
        prev.filter((c) => c.id !== selectedChurchId)
      );

      setShowDelete(false);
      setOpenMenuId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        ← Back
      </button>

      {/* HEADER */}
      <h1 className="text-2xl font-bold">Churches</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, pastor, suburb, or township…"
        className="w-full p-3 border rounded-xl"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* EMPTY STATE */}
      {showEmptyState && (
        <div className="border rounded-xl p-6 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">
            No churches found for{" "}
            <span className="font-medium">"{query}"</span>
          </p>

          <button
            onClick={handleAddChurch}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            My Church is not listed
          </button>
        </div>
      )}

      {/* LIST */}
      {!showEmptyState && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((ch) => {
            const img = ch.image_url || "/default_church.jpg";
            const isOwner = userId && ch.created_by === userId;

            return (
              <div
                key={ch.id}
                className="relative border rounded-xl bg-white shadow hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <Link href={`/churches/${ch.id}`}>
                  <div className="w-full h-40 bg-gray-100 rounded-t-xl overflow-hidden relative">
                    <Image
                      src={img}
                      alt={ch.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* 3 DOT MENU */}
                {isOwner && (
                  <div className="absolute top-2 right-2 z-50">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === ch.id ? null : ch.id
                        )
                      }
                      className="bg-white rounded-full px-2 py-1 shadow"
                    >
                      ⋮
                    </button>

                    {openMenuId === ch.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
                        <Link
                          href={`/churches/${ch.id}/edit`}
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedChurchId(ch.id);
                            setSelectedChurchName(ch.name);
                            setShowDelete(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TEXT */}
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-lg">{ch.name}</h2>
                  <p className="text-sm text-gray-600">
                    Pastor: {ch.pastor_name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[ch.location].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ MODAL */}
      <DeleteChurchModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={loading}
        churchName={selectedChurchName || ""}
      />
    </div>
  );
}