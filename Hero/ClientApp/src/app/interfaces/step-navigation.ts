export interface IStepNavigation {
    setStep(stepNumber: number): void;
    nextStep(): void;
    previousStep(): void;
}
