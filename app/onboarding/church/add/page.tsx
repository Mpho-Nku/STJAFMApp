"use client";

import { useState } from "react";
import { ChurchFormData } from "@/types/church";

// Import Steps
import Step1Name from "./Step1Name";
import Step2Location from "./Step2Location";
import Step3Type from "./Step3Type";
import Step4Details from "./Step4Details";
import Step4Image from "./Step4Image";
import StepReview from "./StepReview";

export default function AddChurchFlow() {

  const TOTAL_STEPS = 6;

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<ChurchFormData>({
    name: "",
    location: "",
    type: "Headquarter",
    description: "",
    pastorName: "",
    image: null,
  });

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Add Church</h1>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <Step1Name formData={formData} setFormData={setFormData} next={next} />
      )}

      {step === 2 && (
        <Step2Location formData={formData} setFormData={setFormData} next={next} back={back} />
      )}

      {step === 3 && (
        <Step3Type formData={formData} setFormData={setFormData} next={next} back={back} />
      )}

      {step === 4 && (
        <Step4Details formData={formData} setFormData={setFormData} next={next} back={back} />
      )}

      {step === 5 && (
        <Step4Image formData={formData} setFormData={setFormData} next={next} back={back} />
      )}

      {step === 6 && (
        <StepReview formData={formData} back={back} />
      )}

    </div>
  );
}