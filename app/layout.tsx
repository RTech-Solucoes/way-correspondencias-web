import './globals.css';
import type { Metadata } from 'next';
import { Lexend as Font } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'

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
          {children}
          <div/>
        </ApiProvider>
      </body>
    </html>
  );
}