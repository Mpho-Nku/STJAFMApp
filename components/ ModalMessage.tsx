"use client";

import { motion, AnimatePresence } from "framer-motion";

type ModalMessageProps = {
  open: boolean;
  onClose: () => void;
  title: string;
};

export default function ModalMessage({ open, onClose, title }: ModalMessageProps) {
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
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            {/* Close button */}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}