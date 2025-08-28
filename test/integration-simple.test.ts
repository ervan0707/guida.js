import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Guida } from '../src/onboarding'
import type { OnboardingStep } from '../src/types'

describe('Guida Integration Tests', () => {
  let container: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <button id="step1-btn">Step 1 Button</button>
        <div id="step2-div">Step 2 Content</div>
        <input id="step3-input" />
      </div>
    `

    container = document.getElementById('test-container')!

    // Mock getBoundingClientRect for all test elements
    const elements = container.querySelectorAll('[id^="step"]')
    elements.forEach((element, index) => {
      const rect = {
        top: 100 + (index * 100),
        left: 100 + (index * 50),
        bottom: 140 + (index * 100),
        right: 200 + (index * 50),
        width: 100 + (index * 50),
        height: 40 + (index * 20),
        x: 100 + (index * 50),
        y: 100 + (index * 100),
        toJSON: () => ({})
      }

        ; (element as HTMLElement).getBoundingClientRect = vi.fn(() => rect)
    })
  })

  const testSteps: OnboardingStep[] = [
    {
      target: '#step1-btn',
      title: 'Welcome',
      description: 'Click this button to get started',
      position: 'bottom',
      action: 'click',
      highlight: true,
      skipable: false
    },
    {
      target: '#step2-div',
      title: 'Content Area',
      description: 'This is where main content appears',
      position: 'left',
      action: 'observe',
      highlight: true,
      skipable: true
    },
    {
      target: '#step3-input',
      title: 'Input Field',
      description: 'Enter your information here',
      position: 'top',
      action: 'observe',
      highlight: true,
      skipable: true
    }
  ]

  describe('Full Onboarding Flow', () => {
    it('should start and complete onboarding', () => {
      const callbacks = {
        onStart: vi.fn(),
        onComplete: vi.fn(),
        onClose: vi.fn()
      }

      const onboarding = new Guida({
        steps: testSteps,
        autoStart: false,
        callbacks
      })

      // Start onboarding
      onboarding.start()
      expect(callbacks.onStart).toHaveBeenCalled()
      expect(onboarding.isActive()).toBe(true)

      // Check overlay and tooltip exist
      const overlay = document.querySelector('.guida-overlay')
      const tooltip = document.querySelector('.guida-tooltip')
      expect(overlay).toBeTruthy()
      expect(tooltip).toBeTruthy()

      // Complete onboarding
      onboarding.complete()
      expect(callbacks.onComplete).toHaveBeenCalled()
    })

    it('should handle navigation through steps', async () => {
      const onboarding = new Guida({
        steps: testSteps,
        autoStart: false
      })

      onboarding.start()
      expect(onboarding.getCurrentStep().index).toBe(0)

      // Navigate to next step with delay
      onboarding.nextStep()
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(onboarding.getCurrentStep().index).toBe(1)

      // Navigate to specific step
      onboarding.goToStep(2)
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(onboarding.getCurrentStep().index).toBe(2)

      // Navigate back
      onboarding.previousStep()
      await new Promise(resolve => setTimeout(resolve, 350))
      expect(onboarding.getCurrentStep().index).toBe(1)
    })

    it('should apply custom classes correctly', () => {
      const customClasses = {
        overlay: 'custom-overlay-class',
        tooltip: 'custom-tooltip-class'
      }

      const onboarding = new Guida({
        steps: testSteps,
        autoStart: false,
        customClasses
      })

      onboarding.start()

      const overlay = document.querySelector('.guida-overlay')
      const tooltip = document.querySelector('.guida-tooltip')

      expect(overlay?.classList.contains('custom-overlay-class')).toBe(true)
      expect(tooltip?.classList.contains('custom-tooltip-class')).toBe(true)
    })

    it('should clean up DOM elements when closed', () => {
      const onboarding = new Guida({
        steps: testSteps,
        autoStart: false
      })

      onboarding.start()

      // Verify elements exist
      expect(document.querySelector('.guida-overlay')).toBeTruthy()

      onboarding.close()

      // Verify elements are removed
      expect(document.querySelector('.guida-overlay')).toBeFalsy()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing target elements gracefully', () => {
      const invalidSteps: OnboardingStep[] = [
        {
          target: '#nonexistent-element',
          title: 'Missing Element',
          description: 'This element does not exist',
          position: 'bottom',
          action: 'observe',
          highlight: true,
          skipable: false
        }
      ]

      const onboarding = new Guida({
        steps: invalidSteps,
        autoStart: false
      })

      // Should not throw error
      expect(() => onboarding.start()).not.toThrow()
      expect(onboarding.isActive()).toBe(true)
    })
  })
})
