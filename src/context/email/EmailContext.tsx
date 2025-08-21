'use client'

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState, ReactNode,
} from "react";

export interface EmailContextProps {
  prop: number | null,
  setProp: Dispatch<SetStateAction<number | null>>;
}

const EmailContext = createContext<EmailContextProps>({} as EmailContextProps);

export const EmailProvider = ({ children }: { children: ReactNode }) => {
  const [prop, setProp] = useState<number | null>(null);

  return (
    <EmailContext.Provider
      value={{
        prop,
        setProp
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export default function useEmail() {
  const context = useContext(EmailContext);

  if (!context) {
    throw new Error("useEmail must be used within a EmailProvider");
  }

  return context;
}
