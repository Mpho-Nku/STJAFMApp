"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  churchName?: string;
};

export default function DeleteChurchModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  churchName,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-center mb-2">
              Delete Church
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {churchName || "this church"}
              </span>
              ? <br />
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}