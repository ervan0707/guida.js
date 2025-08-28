export { Guida } from './onboarding'
export type {
  OnboardingConfig,
  OnboardingStep,
  OnboardingState,
  OnboardingEvents,
  TooltipPosition,
  StepAction
} from './types'

import { Guida } from './onboarding'
import type { OnboardingConfig, OnboardingStep } from './types'

/**
 * Create a new Guida instance with the given configuration
 */
export function createOnboarding(config: OnboardingConfig) {
  return new Guida(config)
}

/**
 * Quick start helper for simple onboarding flows
 */
export function quickStart(steps: OnboardingStep[]) {
  return new Guida({
    steps,
    autoStart: true,
    startDelay: 1000
  })
}
