'use client'

import {IconContext} from "@phosphor-icons/react";
import {ReactNode} from 'react';

interface IconProviderProps {
  children: ReactNode;
}

export default function IconProvider({ children }: IconProviderProps) {
  return (
    <IconContext.Provider
      value={{
        size: 32,
        weight: "bold",
        "aria-hidden": true,
      }}
    >
      {children}
    </IconContext.Provider>
  );
}