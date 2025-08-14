import './globals.css';
import type { Metadata } from 'next';
import { Poppins as Font } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'
import IconProvider from "@/components/providers/IconProvider";
import AuthGuard from "@/components/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

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
  title: 'Way 262 - Software Regulatório',
  description: 'Solução moderna de software regulatório com cliente de email e quadro kanban',
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
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
          <IconProvider>
            <AuthGuard>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </AuthGuard>
          </IconProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
