import { motion } from "framer-motion";
import React from "react";

interface BackdropProps {
  children: React.ReactNode;
}

const Backdrop: React.FC<BackdropProps> = ({ children }) => {
  return (
    <motion.div
      className="absolute top-0 h-screen w-screen bg-black/80 bg-opacity-70 flex items-center justify-center overflow-hidden z-[999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

interface ModalProps {
  children?: React.ReactNode;
  modalWidth?: string;
}

export const Modal = ({ children, modalWidth }: ModalProps) => {
  const dropIn = {
    hidden: {
      y: "-5vh",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.1,
        type: "spring" as const,
        damping: 35,
        stiffness: 700,
      },
    },
    exit: {
      y: "100vh",
      opacity: 0,
    },
  };

  return (
    <Backdrop>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`h-fit`}
        style={{ width: modalWidth }}
      >
        {children}
      </motion.div>
    </Backdrop>
  );
};
