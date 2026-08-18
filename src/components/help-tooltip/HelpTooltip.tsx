'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { QuestionIcon, XIcon } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/utils';

interface HelpTooltipProps {
  content: string;
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({
  content,
  label,
  side = 'top',
  className,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openHelp = () => {
    cancelClose();
    setOpen(true);
  };

  const close = () => {
    cancelClose();
    setOpen(false);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => cancelClose();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            open && 'text-blue-600',
            className
          )}
          aria-label={`Ajuda: ${label}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={tooltipId}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseEnter={openHelp}
          onMouseLeave={scheduleClose}
          onFocus={openHelp}
          onClick={(event) => {
            event.stopPropagation();
            if (event.nativeEvent instanceof PointerEvent && event.nativeEvent.pointerType === 'touch') {
              setOpen((current) => !current);
            }
          }}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            const tooltip = document.getElementById(tooltipId);

            if (nextTarget && tooltip?.contains(nextTarget)) {
              return;
            }

            close();
          }}
        >
          <QuestionIcon className="h-4 w-4" weight="fill" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={tooltipId}
        role="tooltip"
        side={side}
        align="start"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions
        className="z-[60] w-auto max-w-xs p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={openHelp}
        onMouseLeave={scheduleClose}
        onInteractOutside={close}
        onEscapeKeyDown={close}
        onFocusOutside={close}
      >
        <div className="flex items-start gap-2">
          <p className="flex-1 text-xs leading-5 text-popover-foreground">
            {content}
          </p>
          <button
            type="button"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Fechar ajuda"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              close();
            }}
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
