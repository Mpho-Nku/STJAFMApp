"use client";

import { Dispatch, SetStateAction } from "react";
import { ChurchFormData } from "@/types/church";

type Step2LocationProps = {
  formData: ChurchFormData;
  setFormData: Dispatch<SetStateAction<ChurchFormData>>;
  next: () => void;
  back: () => void;
};

export default function Step2Location({
  formData,
  setFormData,
  next,
  back,
}: Step2LocationProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Step 2: Church Location
      </h2>

      <input
        type="text"
        placeholder="Church Location"
        className="w-full border px-3 py-2 rounded-lg"
        value={formData.location}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            location: e.target.value,
          }))
        }
      />

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
          onClick={() => {
            if (!formData.location.trim()) {
              alert("Location is required");
              return;
            }
            next();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}