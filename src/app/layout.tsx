import './globals.css';
import type { Metadata } from 'next';
import { Lexend as DefaultFont } from 'next/font/google';
import { ApiProvider } from '@/api/ApiProvider';
import { ReactNode } from 'react'
import IconProvider from "@/components/providers/IconProvider";
import AuthGuard from "@/components/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "sonner";
import { ModalProvider } from '@/context/modal/ModalContext';

const defaultFont = DefaultFont({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin'],
  variable: '--font-default'
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
      <body className={`${defaultFont.className} ${defaultFont.variable}`}>
        <ApiProvider>
          <IconProvider>
            <AuthGuard>
              <ModalProvider>
                <ConditionalLayout>
                  {children}
                  <Toaster
                    closeButton
                    richColors
                    position="bottom-right"
                  />
                </ConditionalLayout>
              </ModalProvider>
            </AuthGuard>
          </IconProvider>
        </ApiProvider>
      </body>
    </html>
  );
}