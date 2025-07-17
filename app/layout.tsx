import './globals.css';
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'

const figtree = Figtree({ subsets: ['latin'] });

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
      <body className={figtree.className}>
        <ApiProvider>
          {children}
          <div/>
        </ApiProvider>
      </body>
    </html>
  );
}