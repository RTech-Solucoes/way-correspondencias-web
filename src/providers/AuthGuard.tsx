'use client';

import {ReactNode, useEffect, useState} from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { Quantum as Loading } from 'ldrs/react'
import 'ldrs/react/Quantum.css'
import {PAGES_DEF, PUBLIC_ROUTES} from "@/constants/pages";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');

      if (authToken) {

        if (isPublicRoute) {
          router.push(PAGES_DEF[0].path);
          return;
        }
      } else {

        if (!isPublicRoute) {
          router.push('/');
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
          color="#155dfc"
        />
      </div>
    );
  } else {
    return <>{children}</>;
  }
}
