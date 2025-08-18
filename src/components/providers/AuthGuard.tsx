'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { Quantum as Loading } from 'ldrs/react'
import 'ldrs/react/Quantum.css'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const publicRoutes = ['/login', '/cadastro'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');

      if (authToken) {

        if (isPublicRoute) {
          router.push('/');
          return;
        }
      } else {

        if (!isPublicRoute) {
          router.push('/login');
          return;
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router, isPublicRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading
          size="120"
          speed="1.5"
          color="#2b7fff"
        />
      </div>
    );
  } else {
    return <>{children}</>;
  }
}
