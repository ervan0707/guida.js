/**
 * Position where the tooltip should appear relative to the target element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * Action type that determines how the user should interact with the step
 */
export type StepAction = 'click' | 'observe'

/**
 * Configuration for a single onboarding step
 */
export interface OnboardingStep {
  /** CSS selector for the target element */
  target: string
  /** Title shown in the tooltip */
  title: string
  /** Description text shown in the tooltip */
  description: string
  /** Position of the tooltip relative to the target */
  position: TooltipPosition
  /** How the user should interact with this step */
  action: StepAction
  /** Whether to highlight the target element */
  highlight: boolean
  /** Whether this step can be skipped */
  skipable: boolean
  /** Custom spotlight options for this step */
  spotlight?: {
    /** Border radius for the spotlight cutout (in pixels) */
    borderRadius?: number
    /** Extra padding around the highlighted element (in pixels) */
    padding?: number
  }
}

/**
 * Configuration options for the onboarding manager
 */
export interface OnboardingConfig {
  /** Array of onboarding steps */
  steps: OnboardingStep[]
  /** Key used for localStorage to track completion */
  storageKey?: string
  /** Whether to automatically start onboarding for new users */
  autoStart?: boolean
  /** Delay before starting onboarding (in milliseconds) */
  startDelay?: number
  /** Global spotlight configuration */
  spotlight?: {
    /** Default border radius for spotlight cutouts (in pixels) */
    borderRadius?: number
    /** Default padding around highlighted elements (in pixels) */
    padding?: number
    /** Default backdrop opacity as a percentage (0-100) */
    backdropOpacity?: number
  }
  /** Custom CSS classes to apply */
  customClasses?: {
    overlay?: string
    backdrop?: string
    tooltip?: string
    highlight?: string
  }
  /** Callback functions */
  callbacks?: {
    onStart?: () => void
    onComplete?: () => void
    onClose?: () => void
    onStepChange?: (stepIndex: number, step: OnboardingStep) => void
  }
}

/**
 * Events that can be emitted by the onboarding manager
 */
export interface OnboardingEvents {
  start: void
  complete: void
  close: void
  stepChange: { stepIndex: number; step: OnboardingStep }
  beforeStepChange: { currentStepIndex: number; nextStepIndex: number }
}

/**
 * Internal state of the onboarding manager
 */
export interface OnboardingState {
  currentStep: number
  isActive: boolean
  isCompleted: boolean
  overlay: HTMLElement | null
  tooltip: HTMLElement | null
  currentHighlightedElement: HTMLElement | null
  currentStepConfig: OnboardingStep | null
  resizeHandler: (() => void) | null
}
