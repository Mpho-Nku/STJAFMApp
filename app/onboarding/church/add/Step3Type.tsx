"use client";

import { Dispatch, SetStateAction } from "react";
import { ChurchFormData } from "@/types/church";

const churchTypes = ["Circuit", "Headquarter"] as const;

type Step3TypeProps = {
  formData: ChurchFormData;
  setFormData: Dispatch<SetStateAction<ChurchFormData>>;
  next: () => void;
  back: () => void;
};

export default function Step3Type({
  formData,
  setFormData,
  next,
  back,
}: Step3TypeProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 3: Church Type</h2>

      <div className="space-y-3">
        {churchTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                type: type,
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg ${
              formData.type === type
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

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
            if (!formData.type) {
              alert("Please select a church type");
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