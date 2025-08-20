export { SpotlightOnboarding } from './onboarding'
export type {
  OnboardingConfig,
  OnboardingStep,
  OnboardingState,
  OnboardingEvents,
  TooltipPosition,
  StepAction
} from './types'

import { SpotlightOnboarding } from './onboarding'
import type { OnboardingConfig, OnboardingStep } from './types'

// Default export for convenience
export { SpotlightOnboarding as default } from './onboarding'

/**
 * Create a new SpotlightOnboarding instance with the given configuration
 */
export function createOnboarding(config: OnboardingConfig) {
  return new SpotlightOnboarding(config)
}

/**
 * Quick start helper for simple onboarding flows
 */
export function quickStart(steps: OnboardingStep[]) {
  return new SpotlightOnboarding({
    steps,
    autoStart: true,
    startDelay: 1000
  })
}
