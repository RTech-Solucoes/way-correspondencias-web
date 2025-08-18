'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { cn } from "@/utils/utils";
import Sidebar from "@/components/layout/Sidebar";
import {PUBLIC_ROUTES} from "@/constants/pages";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return (
      <main className="flex flex-col min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <main
      className={cn(
        "flex flex-col",
        "min-h-screen max-h-screen w-full h-full scrollbar",
        "bg-gray-50 flex flex-row min-w-0 transition-all duration-300 ease-in-out",
      )}
    >
      <Sidebar/>
      <article>
        {children}
      </article>
    </main>
  );
}
