import './globals.css';
import type { Metadata } from 'next';
import { Lexend as Font } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'
import {cn} from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
const defaultFont = Font({
  weight: [
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900'
  ],
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Way Brasil - Software Regulatório',
  description: 'Solução moderna de software regulatório com cliente de email e quadro kanban',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <html lang="en">
      <body className={defaultFont.className}>
        <ApiProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <main
              className={cn(
                "flex flex-row min-w-0 transition-all duration-300 ease-in-out max-h-screen",
                "w-full h-full"
              )}
            >
              <Sidebar/>
              <div className="flex flex-col w-full overflow-auto min-h-screen">
                {children}
              </div>
            </main>
          </div>
        </ApiProvider>
      </body>
    </html>
  );
}