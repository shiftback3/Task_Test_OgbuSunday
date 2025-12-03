import { useState, useCallback } from 'react';
import type { WizardStep } from '../types';

interface UseWizardOptions {
  initialStep?: string;
  onStepChange?: (stepId: string) => void;
  onComplete?: () => void;
}

export const useWizard = (steps: WizardStep[], options: UseWizardOptions = {}) => {
  const { initialStep, onStepChange, onComplete } = options;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (initialStep) {
      const index = steps.findIndex(step => step.id === initialStep);
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const currentStep = steps[currentStepIndex];
  
  const goToStep = useCallback((stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index >= 0) {
      setCurrentStepIndex(index);
      onStepChange?.(stepId);
    }
  }, [steps, onStepChange]);

  const goToNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onStepChange?.(steps[nextIndex].id);
    }
  }, [currentStepIndex, steps, onStepChange]);

  const goToPrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onStepChange?.(steps[prevIndex].id);
    }
  }, [currentStepIndex, steps, onStepChange]);

  const goToFirst = useCallback(() => {
    setCurrentStepIndex(0);
    onStepChange?.(steps[0].id);
  }, [steps, onStepChange]);

  const complete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  const canGoNext = currentStepIndex < steps.length - 1 && (currentStep?.isValid ?? true);
  const canGoPrevious = currentStepIndex > 0;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return {
    currentStep,
    currentStepIndex,
    steps,
    goToStep,
    goToNext,
    goToPrevious,
    goToFirst,
    complete,
    canGoNext,
    canGoPrevious,
    isFirst,
    isLast,
    progress,
  };
};