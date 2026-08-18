'use client';

import { ReactNode } from 'react';
import { HelpTooltip } from '@/components/help-tooltip/HelpTooltip';
import { cn } from '@/utils/utils';

interface ActionWithHelpProps {
  help: string;
  helpLabel: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function ActionWithHelp({
  help,
  helpLabel,
  children,
  side = 'top',
  className,
}: ActionWithHelpProps) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      {children}
      <HelpTooltip content={help} label={helpLabel} side={side} />
    </div>
  );
}
