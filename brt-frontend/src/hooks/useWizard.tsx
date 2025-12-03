import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isValid: boolean;
}

interface WizardContextType {
  currentStep: number;
  steps: WizardStep[];
  data: Record<string, any>;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  updateData: (key: string, value: any) => void;
  updateStepValidity: (stepId: string, isValid: boolean) => void;
  canProceed: boolean;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

interface WizardProviderProps {
  children: ReactNode;
  steps: Omit<WizardStep, 'isValid'>[];
  onComplete: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({
  children,
  steps: initialSteps,
  onComplete,
  initialData = {},
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [steps, setSteps] = useState<WizardStep[]>(
    initialSteps.map(step => ({ ...step, isValid: false }))
  );

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = steps[currentStep]?.isValid || false;

  const nextStep = () => {
    if (canProceed && !isLastStep) {
      setCurrentStep(currentStep + 1);
    } else if (canProceed && isLastStep) {
      onComplete(data);
    }
  };

  const previousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const updateData = useCallback((key: string, value: any) => {
    setData(prevData => ({
      ...prevData,
      [key]: value,
    }));
  }, []);

  const updateStepValidity = useCallback((stepId: string, isValid: boolean) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, isValid } : step
      )
    );
  }, []);

  const reset = () => {
    setCurrentStep(0);
    setData(initialData);
    setSteps(initialSteps.map(step => ({ ...step, isValid: false })));
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        steps,
        data,
        isFirstStep,
        isLastStep,
        nextStep,
        previousStep,
        goToStep,
        updateData,
        updateStepValidity,
        canProceed,
        reset,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

interface WizardProps {
  className?: string;
}

export const Wizard: React.FC<WizardProps> = ({ className = '' }) => {
  const { currentStep, steps, isFirstStep, isLastStep, nextStep, previousStep, canProceed } = useWizard();

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Progress indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'sm:flex-1' : ''}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-medium text-xs sm:text-sm flex-shrink-0 ${
                index === currentStep
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : index < currentStep
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="ml-3 min-w-0 flex-1 sm:flex-initial">
              <div className={`text-sm font-medium truncate sm:whitespace-normal ${
                index === currentStep
                  ? 'text-blue-600'
                  : index < currentStep
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`hidden sm:block flex-1 h-0.5 ml-4 ${
                index < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        {CurrentStepComponent && <CurrentStepComponent />}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
        <button
          onClick={previousStep}
          disabled={isFirstStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          {isLastStep ? 'Submit Request' : 'Next'}
        </button>
      </div>
    </div>
  );
};