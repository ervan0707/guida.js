import { OnboardingConfig, OnboardingStep, OnboardingState, OnboardingEvents } from './types'
import { DEFAULT_STYLES } from './styles'

/**
 * Modern onboarding library with spotlight highlighting
 */
export class SpotlightOnboarding {
  private config: Required<OnboardingConfig>
  private state: OnboardingState
  private eventListeners: Map<keyof OnboardingEvents, Function[]> = new Map()

  constructor(config: OnboardingConfig) {
    this.config = this.mergeConfig(config)
    this.state = {
      currentStep: 0,
      isActive: false,
      isCompleted: false,
      overlay: null,
      tooltip: null,
      currentHighlightedElement: null,
      resizeHandler: null
    }

    this.init()
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(config: OnboardingConfig): Required<OnboardingConfig> {
    return {
      steps: config.steps,
      storageKey: config.storageKey || 'guida-js-completed',
      autoStart: config.autoStart ?? true,
      startDelay: config.startDelay ?? 1000,
      customClasses: {
        overlay: '',
        backdrop: '',
        tooltip: '',
        highlight: '',
        ...config.customClasses
      },
      callbacks: {
        onStart: () => { },
        onComplete: () => { },
        onClose: () => { },
        onStepChange: () => { },
        ...config.callbacks
      }
    }
  }

  /**
   * Initialize the onboarding system
   */
  private init(): void {
    this.injectStyles()

    if (this.config.autoStart && !this.isCompleted()) {
      setTimeout(() => {
        this.start()
      }, this.config.startDelay)
    }
  }

  /**
   * Inject default styles into the document
   */
  private injectStyles(): void {
    if (document.getElementById('guida-js-styles')) {
      return // Styles already injected
    }

    const styleElement = document.createElement('style')
    styleElement.id = 'guida-js-styles'
    styleElement.textContent = DEFAULT_STYLES
    document.head.appendChild(styleElement)
  }

  /**
   * Start the onboarding flow
   */
  public start(): void {
    if (this.state.isActive || this.config.steps.length === 0) {
      return
    }

    this.state.isActive = true
    this.state.currentStep = 0
    this.createOverlay()
    this.setupResizeHandler()
    this.showStep(this.state.currentStep)

    this.emit('start')
    this.config.callbacks.onStart?.()
  }

  /**
   * Create the overlay and backdrop elements
   */
  private createOverlay(): void {
    // Create overlay
    this.state.overlay = document.createElement('div')
    this.state.overlay.className = `guida-overlay ${this.config.customClasses.overlay}`
    this.state.overlay.innerHTML = `
      <div class="guida-backdrop ${this.config.customClasses.backdrop}"></div>
    `

    // Create tooltip
    this.state.tooltip = document.createElement('div')
    this.state.tooltip.className = `guida-tooltip ${this.config.customClasses.tooltip}`

    document.body.appendChild(this.state.overlay)
    document.body.appendChild(this.state.tooltip)
  }

  /**
   * Show a specific step
   */
  private showStep(stepIndex: number): void {
    if (stepIndex >= this.config.steps.length) {
      this.complete()
      return
    }

    const step = this.config.steps[stepIndex]
    const target = document.querySelector(step.target) as HTMLElement

    if (!target) {
      console.warn(`Spotlight Onboarding: Target not found: ${step.target}`)
      this.nextStep()
      return
    }

    // Emit step change events
    this.emit('stepChange', { stepIndex, step })
    this.config.callbacks.onStepChange?.(stepIndex, step)

    // Highlight target element
    this.highlightElement(target, step.highlight)

    // Position and show tooltip
    this.showTooltip(target, step)

    // Set up interaction handling
    this.setupStepInteraction(target, step)
  }  /**
   * Highlight an element with spotlight effect
   */
  private highlightElement(element: HTMLElement, shouldHighlight: boolean): void {
    // Remove previous highlights
    document.querySelectorAll('.guida-highlight').forEach((el) => {
      el.classList.remove('guida-highlight')
      if (this.config.customClasses.highlight) {
        el.classList.remove(this.config.customClasses.highlight)
      }
    })

    const backdrop = this.state.overlay?.querySelector('.guida-backdrop') as HTMLElement
    this.state.currentHighlightedElement = shouldHighlight ? element : null

    if (shouldHighlight && backdrop) {
      element.classList.add('guida-highlight')
      if (this.config.customClasses.highlight) {
        element.classList.add(this.config.customClasses.highlight)
      }

      this.updateClipPath(element, backdrop)

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })
    } else if (backdrop) {
      // Reset clip-path when no highlight
      backdrop.style.clipPath = 'none'
    }
  }

  /**
   * Update the clip-path for the backdrop to create spotlight effect
   */
  private updateClipPath(element: HTMLElement, backdrop: HTMLElement): void {
    const rect = element.getBoundingClientRect()
    const padding = 8 // Extra space around highlighted element

    // Calculate clip-path coordinates
    const x1 = Math.max(0, rect.left - padding)
    const y1 = Math.max(0, rect.top - padding)
    const x2 = Math.min(window.innerWidth, rect.right + padding)
    const y2 = Math.min(window.innerHeight, rect.bottom + padding)

    // Create clip-path that excludes the highlighted area
    const clipPath = `polygon(
      0% 0%, 
      0% 100%, 
      ${x1}px 100%, 
      ${x1}px ${y1}px, 
      ${x2}px ${y1}px, 
      ${x2}px ${y2}px, 
      ${x1}px ${y2}px, 
      ${x1}px 100%, 
      100% 100%, 
      100% 0%
    )`

    backdrop.style.clipPath = clipPath
  }

  /**
   * Setup resize handler to update clip-path on window resize
   */
  private setupResizeHandler(): void {
    this.state.resizeHandler = () => {
      if (this.state.currentHighlightedElement && this.state.overlay) {
        const backdrop = this.state.overlay.querySelector('.guida-backdrop') as HTMLElement
        if (backdrop) {
          this.updateClipPath(this.state.currentHighlightedElement, backdrop)
        }
      }
    }

    window.addEventListener('resize', this.state.resizeHandler)
  }

  /**
   * Show tooltip for the current step
   */
  private showTooltip(target: HTMLElement, step: OnboardingStep): void {
    if (!this.state.tooltip) return

    const rect = target.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 200

    // Calculate position
    let left: number, top: number

    switch (step.position) {
      case 'top':
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        top = rect.top - tooltipHeight - 20
        break
      case 'bottom':
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        top = rect.bottom + 20
        break
      case 'left':
        left = rect.left - tooltipWidth - 20
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        break
      case 'right':
        left = rect.right + 20
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        break
      default:
        left = rect.right + 20
        top = rect.top
    }

    // Keep tooltip within viewport
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20))
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20))

    this.state.tooltip.style.left = `${left}px`
    this.state.tooltip.style.top = `${top}px`
    this.state.tooltip.style.width = `${tooltipWidth}px`

    // Update tooltip content
    this.state.tooltip.innerHTML = `
      <div class="guida-tooltip-content">
        <div class="guida-header">
          <h3>${step.title}</h3>
          <div class="guida-progress">
            <span>${this.state.currentStep + 1} of ${this.config.steps.length}</span>
          </div>
        </div>
        <p>${step.description}</p>
        <div class="guida-actions">
          ${step.skipable ? '<button class="guida-btn guida-skip">Skip</button>' : ''}
          ${step.action === 'observe' ? '<button class="guida-btn guida-next">Next</button>' : ''}
          <button class="guida-btn guida-close">Close</button>
        </div>
      </div>
      <div class="guida-arrow guida-arrow-${step.position}"></div>
    `

    this.state.tooltip.classList.add('guida-visible')

    // Add event listeners to tooltip buttons
    this.setupTooltipEvents()
  }

  /**
   * Setup event listeners for tooltip buttons
   */
  private setupTooltipEvents(): void {
    if (!this.state.tooltip) return

    const skipBtn = this.state.tooltip.querySelector('.guida-skip') as HTMLButtonElement
    const nextBtn = this.state.tooltip.querySelector('.guida-next') as HTMLButtonElement
    const closeBtn = this.state.tooltip.querySelector('.guida-close') as HTMLButtonElement

    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.nextStep())
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep())
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }
  }

  /**
   * Setup interaction handling for the current step
   */
  private setupStepInteraction(target: HTMLElement, step: OnboardingStep): void {
    if (step.action === 'click') {
      const handleClick = () => {
        target.removeEventListener('click', handleClick)
        setTimeout(() => {
          this.nextStep()
        }, 500)
      }

      target.addEventListener('click', handleClick)
    }
  }

  /**
   * Move to the next step
   */
  public nextStep(): void {
    this.state.currentStep++
    this.hideTooltip()

    setTimeout(() => {
      this.showStep(this.state.currentStep)
    }, 300)
  }

  /**
   * Move to the previous step
   */
  public previousStep(): void {
    if (this.state.currentStep > 0) {
      this.state.currentStep--
      this.hideTooltip()

      setTimeout(() => {
        this.showStep(this.state.currentStep)
      }, 300)
    }
  }

  /**
   * Go to a specific step
   */
  public goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
      this.state.currentStep = stepIndex
      this.hideTooltip()

      setTimeout(() => {
        this.showStep(this.state.currentStep)
      }, 300)
    }
  }

  /**
   * Hide the tooltip
   */
  private hideTooltip(): void {
    if (this.state.tooltip) {
      this.state.tooltip.classList.remove('guida-visible')
    }
  }

  /**
   * Complete the onboarding flow
   */
  public complete(): void {
    this.clearHighlights()
    this.showCompletionMessage()
    this.markAsCompleted()

    this.emit('complete')
    this.config.callbacks.onComplete?.()

    setTimeout(() => {
      this.cleanup()
    }, 3000)
  }

  /**
   * Show completion message
   */
  private showCompletionMessage(): void {
    if (this.state.tooltip) {
      this.state.tooltip.innerHTML = `
        <div class="guida-tooltip-content guida-completion">
          <div class="guida-completion-icon">🎉</div>
          <h3>You're All Set!</h3>
          <p>You've completed the tour! You can now use all the features.</p>
        </div>
      `
      this.state.tooltip.classList.add('guida-visible')
    }
  }

  /**
   * Close the onboarding flow
   */
  public close(): void {
    this.markAsCompleted()
    this.emit('close')
    this.config.callbacks.onClose?.()
    this.cleanup()
  }

  /**
   * Clean up all onboarding elements and listeners
   */
  private cleanup(): void {
    this.state.isActive = false
    this.clearHighlights()

    // Remove resize handler
    if (this.state.resizeHandler) {
      window.removeEventListener('resize', this.state.resizeHandler)
      this.state.resizeHandler = null
    }

    // Remove overlay and tooltip
    if (this.state.overlay) {
      this.state.overlay.remove()
      this.state.overlay = null
    }

    if (this.state.tooltip) {
      this.state.tooltip.remove()
      this.state.tooltip = null
    }

    this.state.currentHighlightedElement = null
  }

  /**
   * Clear all highlights and reset backdrop
   */
  private clearHighlights(): void {
    document.querySelectorAll('.guida-highlight').forEach((el) => {
      el.classList.remove('guida-highlight')
      if (this.config.customClasses.highlight) {
        el.classList.remove(this.config.customClasses.highlight)
      }
    })

    const backdrop = this.state.overlay?.querySelector('.guida-backdrop') as HTMLElement
    if (backdrop) {
      backdrop.style.clipPath = 'none'
    }
  }

  /**
   * Mark onboarding as completed in localStorage
   */
  private markAsCompleted(): void {
    this.state.isCompleted = true
    localStorage.setItem(this.config.storageKey, 'true')
  }

  /**
   * Check if onboarding has been completed
   */
  public isCompleted(): boolean {
    return localStorage.getItem(this.config.storageKey) === 'true'
  }

  /**
   * Reset onboarding (remove completion flag)
   */
  public reset(): void {
    localStorage.removeItem(this.config.storageKey)
    this.state.isCompleted = false
  }

  /**
   * Restart the onboarding flow
   */
  public restart(): void {
    this.reset()
    this.cleanup()
    setTimeout(() => {
      this.start()
    }, 500)
  }

  /**
   * Get current step information
   */
  public getCurrentStep(): { index: number; step: OnboardingStep | null } {
    return {
      index: this.state.currentStep,
      step: this.config.steps[this.state.currentStep] || null
    }
  }

  /**
   * Check if onboarding is currently active
   */
  public isActive(): boolean {
    return this.state.isActive
  }

  /**
   * Add event listener
   */
  public on<K extends keyof OnboardingEvents>(
    event: K,
    callback: (data: OnboardingEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  /**
   * Remove event listener
   */
  public off<K extends keyof OnboardingEvents>(
    event: K,
    callback: (data: OnboardingEvents[K]) => void
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit<K extends keyof OnboardingEvents>(event: K, data?: OnboardingEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data as OnboardingEvents[K]))
    }
  }
}
