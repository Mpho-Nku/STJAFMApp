'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostActions from '@/components/PostActions';

type PostActionsModalProps = {
  postId: string;
  user: { id: string } | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function PostActionsModal({
  postId,
  user,
  isOpen,
  onClose,
}: PostActionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  // Close when clicking outside modal
  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Swipe start
  const handleTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  // Swipe move
  const handleTouchMove = (e: TouchEvent) => {
    currentY.current = e.touches[0].clientY;
  };

  // Swipe end
  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg p-4 max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

            {/* Post Actions */}
            <PostActions postId={postId} user={user} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-2 mt-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 text-sm"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}