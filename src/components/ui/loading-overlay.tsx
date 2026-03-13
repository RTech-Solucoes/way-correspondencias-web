'use client';

import { useEffect } from 'react';
import { Quantum as Loading } from 'ldrs/react';
// @ts-expect-error - react-dom types are available at runtime
import { createPortal } from 'react-dom';
import 'ldrs/react/Quantum.css';

interface LoadingOverlayProps {
  title?: string;
  subtitle?: string;
  size?: string;
  speed?: string;
  color?: string;
}

export default function LoadingOverlay({
  title = 'Carregando...',
  subtitle = 'Aguarde enquanto o processo é concluído',
  size = '80',
  speed = '1.5',
  color = '#276EEB',
}: LoadingOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const overlay = (
    <div 
      className="bg-black/20 backdrop-blur-[2px] flex items-center justify-center loading-overlay-backdrop" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white/98 backdrop-blur-md rounded-2xl p-10 flex flex-col items-center gap-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200/60 loading-overlay-content">
        <div className="relative">
          <Loading
            size={size}
            speed={speed}
            color={color}
          />
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-gray-800 font-semibold text-base tracking-tight">{title}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(overlay, document.body);
}

