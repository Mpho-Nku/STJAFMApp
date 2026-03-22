"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type PrivacyPrefs = {
  hide_email: boolean;
  hide_posts: boolean;
};

export default function PrivacySettings() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>({
    hide_email: false,
    hide_posts: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("hide_email, hide_posts")
        .eq("id", data.user.id)
        .single();

      if (profile) setPrefs(profile);
    };

    load();
  }, []);

  const toggle = (key: keyof PrivacyPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase
      .from("profiles")
      .update(prefs)
      .eq("id", data.user.id);

    setSaving(false);
    alert("Privacy updated!");
  };

  const options: { key: keyof PrivacyPrefs; label: string }[] = [
    { key: "hide_email", label: "Hide my email" },
    { key: "hide_posts", label: "Hide my posts from public feed" },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Settings</h1>

      {options.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between p-4 bg-white border rounded-xl shadow"
        >
          <span className="font-medium">{label}</span>

          <input
            type="checkbox"
            checked={prefs[key]}
            onChange={() => toggle(key)}
          />
        </label>
      ))}

      <button className="btn-primary w-full py-3" onClick={save}>
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}