import './globals.css';
import type {Metadata} from 'next';
import {Lexend as DefaultFont} from 'next/font/google';
import {ReactNode} from 'react'
import Providers from "@/providers/Providers";
import AuthGuard from "@/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import {Toaster} from "sonner";
import { SOFTWARE_NAME, FAVICON_PATH } from '@/lib/branding';

const defaultFont = DefaultFont({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin'],
  variable: '--font-default'
});
export const metadata: Metadata = {
  title: SOFTWARE_NAME,
  applicationName: SOFTWARE_NAME,
  description: 'Software Regulatório — gestão de obrigações, correspondências e tramitações.',
  icons: {
    icon: FAVICON_PATH,
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <html lang="pt-BR">
      <body className={`${defaultFont.className} ${defaultFont.variable} relative`}>
        <AuthGuard>
          <Providers>
            <ConditionalLayout>
              {children}
              <Toaster
                closeButton
                richColors
                position="top-right"
              />
            </ConditionalLayout>
          </Providers>
        </AuthGuard>
      </body>
    </html>
  );
}
