'use client';

import { cn } from '@/utils/utils';
import { CheckIcon } from '@phosphor-icons/react';

interface StepperNavProps {
  currentStep: number;
  canGoToStep: (step: number) => boolean;
  onStepClick: (step: number) => void;
}

const labels: Record<number, string> = {
  1: 'Dados da\nSolicitação',
  2: 'Tema e\nÁreas',
  3: 'Status e\nPrazos',
  4: 'Anexos',
  5: 'Resumo',
};

export default function StepperNav({ currentStep, canGoToStep, onStepClick }: StepperNavProps) {
  return (
    <div className="flex justify-center mb-8 pt-1">
      <div className="flex items-start space-x-4">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((step, idx) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => canGoToStep(step) && onStepClick(step)}
                disabled={!canGoToStep(step)}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed',
                  currentStep === step
                    ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                    : currentStep > step
                    ? 'bg-blue-100 border-blue-300 text-primary'
                    : 'border-gray-300 text-gray-400'
                )}
              >
                {currentStep > step ? <CheckIcon size={20} /> : step}
              </button>
              <span
                className={cn(
                  'text-xs font-medium text-center whitespace-pre-line',
                  currentStep === step
                    ? 'text-primary'
                    : currentStep > step
                    ? 'text-blue-500'
                    : step <= currentStep
                    ? 'text-primary'
                    : 'text-gray-400'
                )}
              >
                {labels[step]}
              </span>
            </div>
            {idx < 4 && (
              <div className={cn('w-16 my-auto h-1 transition-colors', currentStep >= step + 1 ? 'bg-blue-500' : 'bg-gray-300')} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
