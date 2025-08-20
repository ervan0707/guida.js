import { describe, it, expect, vi } from 'vitest'
import { SpotlightOnboarding } from '../src/onboarding'
import type { OnboardingStep } from '../src/types'

// Test helper to create mock DOM elements
function createMockElement(id: string): HTMLElement {
  const element = document.createElement('div')
  element.id = id
  element.getBoundingClientRect = vi.fn(() => ({
    top: 100,
    left: 100,
    bottom: 200,
    right: 200,
    width: 100,
    height: 100,
    x: 100,
    y: 100,
    toJSON: () => ({})
  }))
  document.body.appendChild(element)
  return element
}

const mockSteps: OnboardingStep[] = [
  {
    target: '#step1',
    title: 'Step 1',
    description: 'First step description',
    position: 'bottom',
    action: 'observe',
    highlight: true,
    skipable: false
  },
  {
    target: '#step2',
    title: 'Step 2',
    description: 'Second step description',
    position: 'top',
    action: 'click',
    highlight: true,
    skipable: true
  }
]

describe('SpotlightOnboarding Core', () => {
  describe('Constructor and Initialization', () => {
    it('should create an instance with default config', () => {
      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      expect(onboarding).toBeInstanceOf(SpotlightOnboarding)
      expect(onboarding.isActive()).toBe(false)
      expect(onboarding.isCompleted()).toBe(false)
    })

    it('should inject styles into document head', () => {
      new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      const styleElement = document.getElementById('guida-js-styles')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.tagName).toBe('STYLE')
    })
  })

  describe('Basic Operations', () => {
    it('should start and stop onboarding', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      expect(onboarding.isActive()).toBe(false)

      onboarding.start()
      expect(onboarding.isActive()).toBe(true)

      onboarding.close()
      expect(onboarding.isActive()).toBe(false)
    })

    it('should get current step info', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      onboarding.start()
      const currentStep = onboarding.getCurrentStep()

      expect(currentStep).toEqual({
        index: 0,
        step: mockSteps[0]
      })
    })

    it('should handle empty steps gracefully', () => {
      const onboarding = new SpotlightOnboarding({
        steps: [],
        autoStart: false
      })

      const onStart = vi.fn()
      onboarding.on('start', onStart)

      onboarding.start()
      expect(onStart).not.toHaveBeenCalled()
    })
  })

  describe('Event System', () => {
    it('should emit start event', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      const startHandler = vi.fn()
      onboarding.on('start', startHandler)

      onboarding.start()
      expect(startHandler).toHaveBeenCalled()
    })

    it('should emit close event', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      const closeHandler = vi.fn()
      onboarding.on('close', closeHandler)

      onboarding.start()
      onboarding.close()

      expect(closeHandler).toHaveBeenCalled()
    })
  })

  describe('DOM Manipulation', () => {
    it('should create overlay when starting', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      onboarding.start()

      const overlay = document.querySelector('.guida-overlay')
      expect(overlay).toBeTruthy()
    })

    it('should remove overlay when closing', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false
      })

      onboarding.start()
      onboarding.close()

      const overlay = document.querySelector('.guida-overlay')
      expect(overlay).toBeFalsy()
    })
  })

  describe('Storage', () => {
    it('should save completion state to localStorage', () => {
      createMockElement('step1')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false,
        storageKey: 'test-key'
      })

      onboarding.start()
      onboarding.complete()

      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'true')
    })

    it('should read completion state from localStorage', () => {
      localStorage.getItem = vi.fn().mockReturnValue('true')

      const onboarding = new SpotlightOnboarding({
        steps: mockSteps,
        autoStart: false,
        storageKey: 'test-key'
      })

      expect(onboarding.isCompleted()).toBe(true)
    })
  })
})
