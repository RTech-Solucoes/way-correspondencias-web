'use client';

import React, { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeClosedIcon } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    React.useEffect(() => {
      if (type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [type, showPassword]);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const hasError = !!error;

    return (
      <div className="">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(hasError && "text-destructive")}
          >
            {label}
          </Label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <Input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-foreground transition-colors text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeIcon size={16} />
              ) : (
                <EyeClosedIcon size={16} />
              )}
            </button>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            "text-sm",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };
