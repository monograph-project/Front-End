// GlobalModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

function GloableModal({ open, setOpen, children, isClose, className }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.23 }}
className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 dark:bg-black/70"
          onClick={(e) => {
            // فقط اگر روی پس‌زمینه کلیک شود بسته شود
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative ${className ? className : "p-3"}`}
            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن هنگام کلیک روی محتوا
          >
            {!isClose && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 h-10 w-10 p-2.5 rounded-xl flex items-center justify-center transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
              >
                <svg 
                  className="size-5 stroke-current" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default GloableModal;