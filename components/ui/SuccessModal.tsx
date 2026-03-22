"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  primaryText: string;
  onPrimary: () => void;
};

export default function SuccessModal({
  open,
  title,
  message,
  primaryText,
  onPrimary,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-80 shadow-lg text-center space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-green-600 text-4xl">✔</div>

            {title && (
              <h2 className="font-semibold text-lg text-gray-900">
                {title}
              </h2>
            )}

            <p className="text-gray-600">{message}</p>

            <button
              onClick={onPrimary}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {primaryText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}