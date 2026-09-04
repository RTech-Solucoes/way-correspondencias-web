'use client';

import { ReactNode, useRef, useState } from 'react';
import { InfoIcon } from '@phosphor-icons/react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoLabelProps {
  htmlFor: string;
  children: ReactNode;
  info: string;
  required?: boolean;
}

export function InfoLabel({ htmlFor, children, info, required = false }: InfoLabelProps) {
  const [open, setOpen] = useState(false);
  const pointerMovedRef = useRef(false);

  return (
    <div className="text-sm leading-snug">
      <Label htmlFor={htmlFor} className="inline leading-snug">
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <TooltipProvider delayDuration={250}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Ajuda: ${String(children)}`}
              className="ml-1 inline-flex h-4 w-4 translate-y-[3px] items-center justify-center rounded-full text-slate-400 hover:text-[#276EEB] focus:outline-none"
              onFocus={(event) => event.currentTarget.blur()}
              onPointerEnter={() => {
                if (pointerMovedRef.current) setOpen(true);
              }}
              onPointerMove={() => {
                pointerMovedRef.current = true;
                setOpen(true);
              }}
              onPointerLeave={() => {
                pointerMovedRef.current = false;
                setOpen(false);
              }}
            >
              <InfoIcon className="h-3.5 w-3.5" weight="bold" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-sm leading-relaxed">
            {info}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default InfoLabel;
