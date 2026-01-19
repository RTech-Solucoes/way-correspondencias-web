'use client';

import { useState, useEffect } from 'react';


export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}


export function useClientValue<T>(getValue: () => T, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    setValue(getValue());
  }, [getValue]);

  return value;
}

export default useIsClient;
