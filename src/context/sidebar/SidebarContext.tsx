'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  sidebarWidth: number;
  selectedModule: string;
  setSelectedModule: (moduleId: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedModule, setSelectedModuleState] = useState<string>('correspondencias');

  useEffect(() => {
    const savedModule = localStorage.getItem('selectedModule');
    if (savedModule) {
      setSelectedModuleState(savedModule);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const setSelectedModule = (moduleId: string) => {
    setSelectedModuleState(moduleId);
    localStorage.setItem('selectedModule', moduleId);
  };

  const sidebarWidth = isCollapsed ? 104 : 310;

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, sidebarWidth, selectedModule, setSelectedModule }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 