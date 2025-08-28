import React from 'react';
import { Progress } from '@nextui-org/react';
import { CheckIcon } from '@phosphor-icons/react';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
}

export function Stepper({ 
  currentStep, 
  steps, 
  onStepClick, 
  canNavigateToStep 
}: StepperProps) {
  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="w-full mx-auto mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {currentStepData?.title}
          </h3>
          {currentStepData?.description && (
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Etapa {currentStep} de {steps.length}
          </div>
          <div className="text-xs text-gray-400">
            {Math.round(progressValue)}% concluído
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-md">
        <Progress 
          value={progressValue}
          color="primary"
          size="md"
          className="w-full"
        />
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const canNavigate = canNavigateToStep ? canNavigateToStep(stepNumber) : true;

          return (
            <button
              key={index}
              type="button"
              onClick={() => canNavigate && onStepClick?.(stepNumber)}
              disabled={!canNavigate}
              className={`
                w-4 h-4 rounded-full transition-all duration-200
                ${isActive 
                  ? 'bg-blue-500 scale-125' 
                  : isCompleted
                    ? 'bg-blue-200'
                    : canNavigate
                      ? 'bg-gray-300 hover:bg-gray-400'
                      : 'bg-gray-200 cursor-not-allowed'
                }
              `}
              title={`${steps[index].title} (${stepNumber}/${steps.length})`}
            />
          );
        })}
      </div>
    </div>
  );
} 