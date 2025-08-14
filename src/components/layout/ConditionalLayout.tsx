'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cn } from "@/utils/utils";
import Sidebar from "@/components/layout/Sidebar";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const publicRoutes = ['/login', '/cadastro'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <main
      className={cn(
        "min-h-screen bg-gray-50 flex flex-row min-w-0 transition-all duration-300 ease-in-out max-h-screen",
        "w-full h-full"
      )}
    >
      <Sidebar/>
      <div className="flex flex-col w-full overflow-auto min-h-screen">
        {children}
      </div>
    </main>
  );
}
