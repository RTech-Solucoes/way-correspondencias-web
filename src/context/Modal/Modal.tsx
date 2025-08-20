'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export interface ModalContextI {
  modalContent: React.ReactNode | null;
  setModalContent: Dispatch<SetStateAction<React.ReactNode | null>>;
}

const ModalContext = createContext<ModalContextI>({} as ModalContextI);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );

  return (
    <ModalContext.Provider
      value={{
        modalContent,
        setModalContent,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}
