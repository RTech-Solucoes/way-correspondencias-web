'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
        <div className="flex relative animate-spin rounded-full h-16 w-16 border-8 border-border border-b-blue-600"/>
      </div>
    );
  } else {
    return <>{children}</>;
  }
}
