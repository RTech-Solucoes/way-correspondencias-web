'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/api/client';

interface ApiContextType {
  client: typeof apiClient;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export function ApiProvider({ children, baseUrl }: ApiProviderProps) {
  // If a custom baseUrl is provided, create a new client instance
  const client = baseUrl ? new (apiClient.constructor as any)(baseUrl) : apiClient;

  return (
    <ApiContext.Provider value={{ client }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context.client;
}