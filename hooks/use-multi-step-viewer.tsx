'use client'
import type { JSX } from 'react'
import * as React from 'react'
import { createContext, type ReactNode, useContext, useState } from 'react'

export interface Stepfields {
	title?: string
	fields: string[]
	component: JSX.Element
}

export interface UseMultiFormStepsReturn {
	steps: Stepfields[]
	currentStepIndex: number
	currentStepData: Stepfields
	progress: number
	isFirstStep: boolean
	isLastStep: boolean
	goToNext: () => Promise<boolean>
	goToPrevious: () => void
	goToFirstStep: () => void
	goToStep: (stepNumber: number) => Promise<boolean> | boolean | void
	setSteps: (newSteps: Stepfields[]) => void
}

// Context type
interface MultiStepFormContextType extends UseMultiFormStepsReturn {}

// Create context
const MultiStepFormContext = createContext<MultiStepFormContextType | null>(
	null,
)

// Provider props
interface MultiStepFormProviderProps {
	children: ReactNode
	stepsFields: Stepfields[]
	onStepValidation?: (step: Stepfields, stepIndex: number) => Promise<boolean> | boolean
}

// Provider component
export function MultiStepFormProvider({
	children,
	stepsFields,
	onStepValidation,
}: MultiStepFormProviderProps) {
	const [steps, setStepsState] = useState<Stepfields[]>(stepsFields)
	const [currentStepIndex, setCurrentStepIndex] = useState(1)

	React.useEffect(() => {
		setStepsState(stepsFields)
		if (currentStepIndex > stepsFields.length) {
			setCurrentStepIndex(stepsFields.length > 0 ? stepsFields.length : 1)
		}
	}, [stepsFields, currentStepIndex])

	const goToNext = async () => {
		const currentStepData = steps[currentStepIndex - 1]

		if (onStepValidation) {
			const isValid = await onStepValidation(currentStepData, currentStepIndex)
			if (!isValid) return false
		}

		if (currentStepIndex < steps.length) {
			setCurrentStepIndex((prev) => prev + 1)
			return true
		}
		return false
	}

	const goToPrevious = () => {
		if (currentStepIndex > 1) {
			setCurrentStepIndex((prev) => prev - 1)
		}
	}

	const goToFirstStep = () => {
		setCurrentStepIndex(1)
	}

	const goToStep = async (stepNumber: number) => {
		if (stepNumber < 1 || stepNumber > steps.length || stepNumber === currentStepIndex) {
			return false
		}

		if (stepNumber > currentStepIndex) {
			const currentStepData = steps[currentStepIndex - 1]
			if (onStepValidation) {
				const isValid = await onStepValidation(currentStepData, currentStepIndex)
				if (!isValid) return false
			}
		}

		setCurrentStepIndex(stepNumber)
		return true
	}

	const setSteps = (newSteps: Stepfields[]) => {
		setStepsState(newSteps)
		// Reset to first step if current step is out of bounds
		if (currentStepIndex > newSteps.length) {
			setCurrentStepIndex(1)
		}
	}

	const value: MultiStepFormContextType = {
		steps,
		currentStepIndex: currentStepIndex,
		currentStepData: steps[currentStepIndex - 1],
		progress: (currentStepIndex / steps.length) * 100,
		isFirstStep: currentStepIndex === 1,
		isLastStep: currentStepIndex === steps.length,
		goToNext,
		goToPrevious,
		goToFirstStep,
		goToStep,
		setSteps,
	}

	return (
		<MultiStepFormContext.Provider value={value}>
			{children}
		</MultiStepFormContext.Provider>
	)
}

// Hook to consume context
export function useMultiStepForm(): UseMultiFormStepsReturn {
	const context = useContext(MultiStepFormContext)

	if (!context) {
		throw new Error(
			'useMultiStepForm must be used within a MultiStepFormProvider',
		)
	}

	return context as UseMultiFormStepsReturn
}
