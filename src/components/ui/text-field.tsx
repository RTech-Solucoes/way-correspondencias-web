'use client';

import * as React from 'react';
import { cn } from '@/utils/utils';
import {
  forwardRef,
  ComponentPropsWithoutRef,
  ElementRef,
  ComponentType,
  useId,
  useState,
  ChangeEvent,
  Ref
} from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SpinnerIcon, WarningCircleIcon, WarningIcon, EyeIcon, EyeClosedIcon } from '@phosphor-icons/react';

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;

  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  as?: 'input' | 'textarea';
  rows?: number;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  loading?: boolean;

  error?: string;
  warning?: string;
  helperText?: string;

  startIcon?: ComponentType<{ className?: string }>;
  endIcon?: ComponentType<{ className?: string }>;

  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';

  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;

  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    type = 'text',
    as = 'input',
    rows = 3,
    disabled = false,
    readOnly = false,
    required = false,
    loading = false,
    error,
    warning,
    helperText,
    startIcon: StartIcon,
    endIcon: EndIcon,
    variant = 'default',
    size = 'md',
    id,
    name,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    className,
    labelClassName,
    inputClassName,
    containerClassName,
  }, ref) => {
    const reactId = useId();
    const fieldId = id || reactId;

    // Password visibility state (only for password inputs)
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const actualInputType = isPasswordType && showPassword ? 'text' : type;

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Determine if we need icon spacing
    const hasStartIcon = StartIcon || loading;
    const hasEndIcon = EndIcon || loading || isPasswordType;

    const iconSpacing = {
      sm: hasStartIcon ? 'pl-8' : '',
      md: hasStartIcon ? 'pl-10' : '',
      lg: hasStartIcon ? 'pl-12' : '',
    };

    const endIconSpacing = {
      sm: hasEndIcon ? 'pr-8' : '',
      md: hasEndIcon ? 'pr-10' : '',
      lg: hasEndIcon ? 'pr-12' : '',
    };

    // State-based styling for borders and rings
    const getStateClassName = () => {
      if (error) return 'border-red-500 focus-visible:ring-red-500';
      if (warning) return 'border-yellow-500 focus-visible:ring-yellow-500';
      return '';
    };

    const inputClassNames = cn(
      hasStartIcon && iconSpacing[size],
      hasEndIcon && endIconSpacing[size],
      getStateClassName(),
      inputClassName
    );

    return (
      <div className={cn('flex flex-col gap-1', containerClassName, className)}>
        {/* Label */}
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(
              'text-sm font-medium leading-none',
              disabled && 'opacity-50',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-orange-500 ml-1">*</span>}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {hasStartIcon && (
            <div className={cn(
              'absolute left-0 top-0 h-full flex items-center justify-center',
              size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : 'w-12',
              disabled && 'opacity-50'
            )}>
              {loading ? (
                <SpinnerIcon className={cn(
                  'animate-spin text-blue-500',
                  size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
                )} />
              ) : StartIcon ? (
                <StartIcon className={cn(
                  'text-gray-500',
                  size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
                )} />
              ) : null}
            </div>
          )}

          {/* Input/Textarea */}
          {as === 'textarea' ? (
            <Textarea
              ref={ref as Ref<HTMLTextAreaElement>}
              id={fieldId}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled || loading}
              readOnly={readOnly}
              autoFocus={autoFocus}
              maxLength={maxLength}
              minLength={minLength}
              rows={rows}
              variant={variant}
              inputSize={size}
              className={inputClassNames}
            />
          ) : (
            <Input
              ref={ref as Ref<HTMLInputElement>}
              type={actualInputType}
              id={fieldId}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled || loading}
              readOnly={readOnly}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              maxLength={maxLength}
              minLength={minLength}
              variant={variant}
              inputSize={size}
              className={inputClassNames}
            />
          )}

          {/* End Icon or Password Toggle */}
          {!loading && (
            <div className={cn(
              'absolute right-0 top-0 h-full flex items-center justify-center',
              size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : 'w-12',
              disabled && 'opacity-50'
            )}>
              {isPasswordType ? (
                <button
                  type="button"
                  className={cn(
                    'p-1 rounded transition-colors',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={togglePasswordVisibility}
                  disabled={disabled || loading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeIcon className={cn(
                      'text-gray-500',
                      size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
                    )} />
                  ) : (
                    <EyeClosedIcon className={cn(
                      'text-gray-500',
                      size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
                    )} />
                  )}
                </button>
              ) : EndIcon ? (
                <EndIcon className={cn(
                  'text-gray-500',
                  size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
                )} />
              ) : null}
            </div>
          )}

          {/* Loading Spinner (End Position) */}
          {loading && (
            <div className={cn(
              'absolute right-0 top-0 h-full flex items-center justify-center',
              size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : 'w-12'
            )}>
              <SpinnerIcon className={cn(
                'animate-spin text-blue-500',
                size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
              )} />
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-1">
            <WarningCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {warning && !error && (
          <div className="flex items-center gap-1">
            <WarningIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-600 text-sm">{warning}</p>
          </div>
        )}

        {helperText && !error && !warning && (
          <p className="text-gray-500 text-sm">{helperText}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };
