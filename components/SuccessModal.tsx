"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type SuccessModalProps = {
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  autoClose?: boolean;
};

export default function SuccessModal({
  message,
  isOpen,
  onClose,
  autoClose = true,
}: SuccessModalProps) {

  // ✅ Auto close after 2s
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  // ✅ Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-[320px] shadow-xl text-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ICON */}
            <div className="flex justify-center mb-3">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>

            {/* MESSAGE */}
            <p className="font-semibold text-lg mb-5">
              {message}
            </p>

            {/* BUTTON */}
            <button
              onClick={onClose}
              className="bg-black text-white px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}