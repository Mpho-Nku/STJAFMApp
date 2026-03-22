"use client";

import { Dispatch, SetStateAction } from "react";
import { ChurchFormData } from "@/types/church";

type Step5ImageProps = {
  formData: ChurchFormData;
  setFormData: Dispatch<SetStateAction<ChurchFormData>>;
  next: () => void;
  back: () => void;
};

export default function Step5Image({
  formData,
  setFormData,
  next,
  back,
}: Step5ImageProps) {

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 5: Upload Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="w-full border px-3 py-2 rounded-lg"
      />

      {formData.image && (
        <p className="text-sm text-gray-500 mt-2">
          Image selected: {formData.image.name}
        </p>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={back}
          className="px-4 py-2 border rounded-lg"
        >
          Back
        </button>

        <button
          type="button"
          onClick={next}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}