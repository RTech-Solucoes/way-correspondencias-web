import './globals.css';
import type {Metadata} from 'next';
import {Lexend as DefaultFont} from 'next/font/google';
import {ReactNode} from 'react'
import Providers from "@/providers/Providers";
import AuthGuard from "@/providers/AuthGuard";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import {Toaster} from "sonner";

const defaultFont = DefaultFont({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin'],
  variable: '--font-default'
});

const layoutClient = process.env.NEXT_PUBLIC_LAYOUT_CLIENT || "way262";
let labelTitle = "";
  
  if (layoutClient === "way262") {
    labelTitle = "Way 262";
  } else if (layoutClient === "mvp") {
    labelTitle = "RTech";
  }

export const metadata: Metadata = {
  title: `${labelTitle} - Software Regulatório`,
  description: `Software Regulatório de tramitações ${labelTitle}`,
  icons: {
    icon: `/images/${layoutClient}-favicon.png`,
    shortcut: `/images/${layoutClient}-favicon.png`,
    apple: `/images/${layoutClient}-favicon.png`,
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