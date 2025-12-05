import './globals.css';
import type {Metadata} from 'next';
import {Lexend as DefaultFont} from 'next/font/google';
import {ReactNode} from 'react'
import Providers from "@/providers/Providers";
import AuthGuard from "@/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import {Toaster} from "sonner";
import { getLayoutClient, getLabelTitle, getFaviconPath, getNomeSistema } from "@/lib/layout/layout-client";

const defaultFont = DefaultFont({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin'],
  variable: '--font-default'
});

const layoutClient = getLayoutClient();
const labelTitle = getLabelTitle(layoutClient);
const nomeSistema = getNomeSistema(layoutClient);
const faviconPath = getFaviconPath(layoutClient);

export const metadata: Metadata = {
  title: `${labelTitle} - ${nomeSistema}`,
  description: `${nomeSistema} de tramitações ${labelTitle}`,
  icons: {
    icon: faviconPath,
    shortcut: faviconPath,
    apple: faviconPath,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <html lang="en">
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