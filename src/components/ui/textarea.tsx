import * as React from 'react';
import {forwardRef, TextareaHTMLAttributes} from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/utils';

const textareaVariants = cva(
  'flex w-full rounded-3xl ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 border border-input shadow-sm focus-visible:shadow-md focus-visible:ring-1',
  {
    variants: {
      variant: {
        default: 'bg-background focus-visible:ring-ring',
        filled: 'bg-gray-100 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-ring',
        outlined: 'border-2 border-input bg-transparent focus-visible:ring-1 focus-visible:ring-ring',
        ghost: 'bg-transparent hover:bg-gray-50 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-ring',
      },
      inputSize: {
        sm: 'min-h-[60px] px-3 py-2 text-xs',
        md: 'min-h-[80px] px-4 py-3 text-sm',
        lg: 'min-h-[100px] px-5 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textareaVariants> { }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, inputSize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
