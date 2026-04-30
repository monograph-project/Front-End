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
          className="bg-text-400/20  backdrop-blur-[1px]  bg-shell/80 dark:bg-primary/80   h-screen  mx-auto   fixed inset-0 z-999 flex justify-center items-center  cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative  ${className ? className : "p-3"}`}
          >
            {!isClose && (
              <AiOutlineClose
                className=" absolute top-5 right-4 p4"
                onClick={() => setOpen(false)}
              />
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
