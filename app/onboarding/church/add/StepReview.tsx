"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ChurchFormData } from "@/types/church";

type StepReviewProps = {
  formData: ChurchFormData;
  back: () => void;
};

export default function StepReview({ formData, back }: StepReviewProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

const handleSubmit = async () => {
  try {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { error } = await supabase.from("churches").insert([
      {
           name: formData.name,
          location: formData.location,
          type: formData.type,
          description: formData.description || null,
          pastor_name: formData.pastorName || null,
          image_url: formData.image ? URL.createObjectURL(formData.image) : null,
          created_by: user.id, // ✅ KEY FIX

      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ SHOW SUCCESS
    setSuccess(true);

    // ✅ WAIT THEN REDIRECT
    setTimeout(() => {
      router.push("/churches");
    }, 1800);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review Church</h2>

      <div className="space-y-3 text-sm">
        <p><strong>Name:</strong> {formData.name}</p>
        <p><strong>Location:</strong> {formData.location}</p>
        <p><strong>Type:</strong> {formData.type}</p>
        <p><strong>Description:</strong> {formData.description || "-"}</p>
        <p><strong>Pastor Name:</strong> {formData.pastorName || "-"}</p>

        {formData.image && (
          <div>
            <strong>Image Preview:</strong>
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="mt-2 w-40 rounded-lg border"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={back}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Church"}
        </button>
      </div>
    </div>
  );
}