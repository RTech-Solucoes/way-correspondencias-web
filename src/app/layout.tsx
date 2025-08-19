import './globals.css';
import type { Metadata } from 'next';
import { Outfit as DefaultFont } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'
import IconProvider from "@/components/providers/IconProvider";
import AuthGuard from "@/components/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultFont = DefaultFont({
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Way 262 - Software Regulatório',
  description: 'Software Regulatório de tramitações Way 262',
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
                <ToastContainer />
              </ConditionalLayout>
            </AuthGuard>
          </IconProvider>
        </ApiProvider>
      </body>
    </html>
  );
}