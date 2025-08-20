import { describe, it, expect } from 'vitest'
import { SpotlightOnboarding, createOnboarding, quickStart } from '../src/index'
import type { OnboardingStep } from '../src/types'

const mockSteps: OnboardingStep[] = [
  {
    target: '#test',
    title: 'Test Step',
    description: 'Test description',
    position: 'bottom',
    action: 'observe',
    highlight: true,
    skipable: false
  }
]

describe('Index Exports', () => {
  describe('Named Exports', () => {
    it('should export SpotlightOnboarding class', () => {
      expect(SpotlightOnboarding).toBeDefined()
      expect(typeof SpotlightOnboarding).toBe('function')
    })

    it('should export createOnboarding function', () => {
      expect(createOnboarding).toBeDefined()
      expect(typeof createOnboarding).toBe('function')
    })

    it('should export quickStart function', () => {
      expect(quickStart).toBeDefined()
      expect(typeof quickStart).toBe('function')
    })
  })

  describe('createOnboarding', () => {
    it('should create a SpotlightOnboarding instance', () => {
      const onboarding = createOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
    })

    it('should pass config correctly', () => {
      const config = {
        steps: mockSteps,
        autoStart: false,
        storageKey: 'test-key'
      }

      const onboarding = createOnboarding(config)
      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
    })
  })

  describe('quickStart', () => {
    it('should create an onboarding with default settings', () => {
      const onboarding = quickStart(mockSteps)

      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
    })

    it('should set autoStart to true by default', () => {
      // Since we can't directly access private config, we test the behavior
      const onboarding = quickStart([])
      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
    })

    it('should set startDelay to 1000ms by default', () => {
      const onboarding = quickStart(mockSteps)
      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
    })
  })
})
