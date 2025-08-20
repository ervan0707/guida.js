import { describe, it, expect } from 'vitest'
import type {
  OnboardingStep,
  OnboardingConfig,
  OnboardingState,
  OnboardingEvents,
  TooltipPosition,
  StepAction
} from '../src/types'

describe('Types', () => {
  describe('TooltipPosition', () => {
    it('should accept valid position values', () => {
      const positions: TooltipPosition[] = ['top', 'bottom', 'left', 'right']

      positions.forEach(position => {
        expect(['top', 'bottom', 'left', 'right']).toContain(position)
      })
    })
  })

  describe('StepAction', () => {
    it('should accept valid action values', () => {
      const actions: StepAction[] = ['click', 'observe']

      actions.forEach(action => {
        expect(['click', 'observe']).toContain(action)
      })
    })
  })

  describe('OnboardingStep', () => {
    it('should have all required properties', () => {
      const step: OnboardingStep = {
        target: '#test',
        title: 'Test',
        description: 'Test description',
        position: 'bottom',
        action: 'observe',
        highlight: true,
        skipable: false
      }

      expect(step.target).toBe('#test')
      expect(step.title).toBe('Test')
      expect(step.description).toBe('Test description')
      expect(step.position).toBe('bottom')
      expect(step.action).toBe('observe')
      expect(step.highlight).toBe(true)
      expect(step.skipable).toBe(false)
    })

    it('should support different positions', () => {
      const positions: TooltipPosition[] = ['top', 'bottom', 'left', 'right']

      positions.forEach(position => {
        const step: OnboardingStep = {
          target: '#test',
          title: 'Test',
          description: 'Test description',
          position,
          action: 'observe',
          highlight: true,
          skipable: false
        }

        expect(step.position).toBe(position)
      })
    })

    it('should support different actions', () => {
      const actions: StepAction[] = ['click', 'observe']

      actions.forEach(action => {
        const step: OnboardingStep = {
          target: '#test',
          title: 'Test',
          description: 'Test description',
          position: 'bottom',
          action,
          highlight: true,
          skipable: false
        }

        expect(step.action).toBe(action)
      })
    })

    it('should support spotlight configuration', () => {
      const step: OnboardingStep = {
        target: '#test',
        title: 'Test',
        description: 'Test description',
        position: 'bottom',
        action: 'observe',
        highlight: true,
        skipable: false,
        spotlight: {
          borderRadius: 12,
          padding: 16
        }
      }

      expect(step.spotlight?.borderRadius).toBe(12)
      expect(step.spotlight?.padding).toBe(16)
    })

    it('should work without spotlight configuration', () => {
      const step: OnboardingStep = {
        target: '#test',
        title: 'Test',
        description: 'Test description',
        position: 'bottom',
        action: 'observe',
        highlight: true,
        skipable: false
      }

      expect(step.spotlight).toBeUndefined()
    })
  })

  describe('OnboardingConfig', () => {
    it('should have required steps property', () => {
      const config: OnboardingConfig = {
        steps: [{
          target: '#test',
          title: 'Test',
          description: 'Test description',
          position: 'bottom',
          action: 'observe',
          highlight: true,
          skipable: false
        }]
      }

      expect(config.steps).toBeDefined()
      expect(Array.isArray(config.steps)).toBe(true)
    })

    it('should support optional properties', () => {
      const config: OnboardingConfig = {
        steps: [],
        storageKey: 'custom-key',
        autoStart: false,
        startDelay: 2000,
        spotlight: {
          borderRadius: 10,
          padding: 12
        },
        customClasses: {
          overlay: 'custom-overlay',
          backdrop: 'custom-backdrop',
          tooltip: 'custom-tooltip',
          highlight: 'custom-highlight'
        },
        callbacks: {
          onStart: () => { },
          onComplete: () => { },
          onClose: () => { },
          onStepChange: () => { }
        }
      }

      expect(config.storageKey).toBe('custom-key')
      expect(config.autoStart).toBe(false)
      expect(config.startDelay).toBe(2000)
      expect(config.spotlight?.borderRadius).toBe(10)
      expect(config.spotlight?.padding).toBe(12)
      expect(config.customClasses?.overlay).toBe('custom-overlay')
      expect(config.callbacks?.onStart).toBeDefined()
    })

    it('should work without spotlight configuration', () => {
      const config: OnboardingConfig = {
        steps: [{
          target: '#test',
          title: 'Test',
          description: 'Test description',
          position: 'bottom',
          action: 'observe',
          highlight: true,
          skipable: false
        }]
      }

      expect(config.spotlight).toBeUndefined()
    })
  })

  describe('OnboardingState', () => {
    it('should have all required properties', () => {
      const state: OnboardingState = {
        currentStep: 0,
        isActive: false,
        isCompleted: false,
        overlay: null,
        tooltip: null,
        currentHighlightedElement: null,
        currentStepConfig: null,
        resizeHandler: null
      }

      expect(state.currentStep).toBe(0)
      expect(state.isActive).toBe(false)
      expect(state.isCompleted).toBe(false)
      expect(state.overlay).toBe(null)
      expect(state.tooltip).toBe(null)
      expect(state.currentHighlightedElement).toBe(null)
      expect(state.currentStepConfig).toBe(null)
      expect(state.resizeHandler).toBe(null)
    })

    it('should support DOM elements', () => {
      const element = document.createElement('div')
      const handler = () => { }
      const stepConfig = {
        target: '#test',
        title: 'Test',
        description: 'Test description',
        position: 'bottom' as const,
        action: 'observe' as const,
        highlight: true,
        skipable: false
      }

      const state: OnboardingState = {
        currentStep: 1,
        isActive: true,
        isCompleted: false,
        overlay: element,
        tooltip: element,
        currentHighlightedElement: element,
        currentStepConfig: stepConfig,
        resizeHandler: handler
      }

      expect(state.overlay).toBe(element)
      expect(state.tooltip).toBe(element)
      expect(state.currentHighlightedElement).toBe(element)
      expect(state.currentStepConfig).toBe(stepConfig)
      expect(state.resizeHandler).toBe(handler)
    })
  })

  describe('OnboardingEvents', () => {
    it('should define event types correctly', () => {
      // This is a compile-time check - if the types are wrong, TypeScript will error
      const events: OnboardingEvents = {
        start: undefined,
        complete: undefined,
        close: undefined,
        stepChange: {
          stepIndex: 0,
          step: {
            target: '#test',
            title: 'Test',
            description: 'Test description',
            position: 'bottom',
            action: 'observe',
            highlight: true,
            skipable: false
          }
        },
        beforeStepChange: {
          currentStepIndex: 0,
          nextStepIndex: 1
        }
      }

      expect(events.start).toBe(undefined)
      expect(events.complete).toBe(undefined)
      expect(events.close).toBe(undefined)
      expect(events.stepChange.stepIndex).toBe(0)
      expect(events.beforeStepChange.currentStepIndex).toBe(0)
    })
  })
})
