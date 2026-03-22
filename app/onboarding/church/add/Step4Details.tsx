"use client";

import { Dispatch, SetStateAction } from "react";
import { ChurchFormData } from "@/types/church";

type Step4DetailsProps = {
  formData: ChurchFormData;
  setFormData: Dispatch<SetStateAction<ChurchFormData>>;
  next: () => void;
  back: () => void;
};

export default function Step4Details({
  formData,
  setFormData,
  next,
  back,
}: Step4DetailsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 4: Details</h2>

      {/* Pastor Name */}
      <input
        type="text"
        placeholder="Pastor Name"
        className="w-full border px-3 py-2 rounded-lg mb-4"
        value={formData.pastorName}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            pastorName: e.target.value,
          }))
        }
      />

      {/* Description */}
      <textarea
        placeholder="Church description"
        className="w-full border px-3 py-2 rounded-lg mb-4"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />

      <div className="flex justify-between mt-6">
        <button onClick={back} className="border px-4 py-2 rounded-lg">
          Back
        </button>

        <button
          onClick={next}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}