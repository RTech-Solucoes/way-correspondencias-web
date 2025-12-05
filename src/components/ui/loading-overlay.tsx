'use client';

import { Quantum as Loading } from 'ldrs/react';
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
  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[2px] flex items-center justify-center loading-overlay-backdrop">
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
}

