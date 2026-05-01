import React from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

function GloableModal({ open, setOpen, children, isClose, className }) {
  // const ref = useClickOutSide(() => setOpen(false));
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.23 }}
          className="fixed inset-0 z-999 flex items-center justify-center p-4 backdrop-blur-[2px] bg-black/30 dark:bg-black/55"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative w-full ${className ? className : "p-3"} cursor-auto`}
          >
            {isClose && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors bg-(--color-light-input-bg) border-(--color-light-input-border) text-light-text-secondary hover:text-(--color-light-text-primary) hover:bg-(--color-light-card-hover) dark:bg-(--color-dark-input-bg) dark:border-dark-input-border dark:text-dark-text-secondary dark:hover:text-(--color-dark-text-primary) dark:hover:bg-(--color-dark-card-hover)"
                aria-label="Close modal"
              >
                <AiOutlineClose className="h-4 w-4" />
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
