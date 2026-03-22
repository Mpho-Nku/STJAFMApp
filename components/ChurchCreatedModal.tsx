"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type ChurchCreatedModalProps = {
  open: boolean;
  onClose: () => void;
  churchId: string;
};

export default function ChurchCreatedModal({
  open,
  onClose,
  churchId,
}: ChurchCreatedModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Church created successfully!
            </h2>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(`/churches/${churchId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                View Church
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}