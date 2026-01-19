'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/api/auth/client';
export function useIdResponsavelLogado(): number | null {
  const [idResponsavel, setIdResponsavel] = useState<number | null>(null);

  useEffect(() => {
    const id = authClient.getUserIdResponsavelFromToken();
    setIdResponsavel(id);
  }, []);

  return idResponsavel;
}

export default useIdResponsavelLogado;
