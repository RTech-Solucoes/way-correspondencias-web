'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { HelpTooltip } from '@/components/help-tooltip/HelpTooltip';
import { cn } from '@/utils/utils';

interface FieldHelpLabelProps {
  htmlFor?: string;
  children: ReactNode;
  help: string;
  helpLabel?: string;
  required?: boolean;
  showHelp?: boolean;
  className?: string;
}

export function FieldHelpLabel({
  htmlFor,
  children,
  help,
  helpLabel,
  required = false,
  showHelp = true,
  className,
}: FieldHelpLabelProps) {
  const accessibleLabel = helpLabel ?? (typeof children === 'string' ? children : 'campo');

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {children}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {showHelp && (
        <HelpTooltip content={help} label={accessibleLabel} side="top" />
      )}
    </div>
  );
}
