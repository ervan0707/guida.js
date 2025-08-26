import { OnboardingConfig, OnboardingStep, OnboardingState, OnboardingEvents } from './types'
import { DEFAULT_STYLES } from './styles'

/**
 * Internal configuration with all required properties
 */
type MergedOnboardingConfig = Required<Omit<OnboardingConfig, 'spotlight'>> & {
  spotlight: {
    borderRadius: number
    padding: number
    backdropOpacity: number
  }
}

/**
 * Modern onboarding library with spotlight highlighting
 */
export class SpotlightOnboarding {
  private config: MergedOnboardingConfig
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
      currentStepConfig: null,
      resizeHandler: null,
      scrollHandler: null
    }

    this.init()
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(config: OnboardingConfig): MergedOnboardingConfig {
    return {
      steps: config.steps,
      storageKey: config.storageKey || 'guida-js-completed',
      autoStart: config.autoStart ?? true,
      startDelay: config.startDelay ?? 1000,
      spotlight: {
        borderRadius: config.spotlight?.borderRadius ?? 8,
        padding: config.spotlight?.padding ?? 8,
        backdropOpacity: config.spotlight?.backdropOpacity ?? 50
      },
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

    // Apply custom backdrop opacity
    const backdrop = this.state.overlay.querySelector('.guida-backdrop') as HTMLElement
    if (backdrop) {
      const opacity = this.config.spotlight.backdropOpacity / 100
      backdrop.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`
    }

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
    this.state.currentStepConfig = step
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
    this.highlightElement(target, step.highlight, step)

    // Position and show tooltip
    this.showTooltip(target, step)

    // Set up interaction handling
    this.setupStepInteraction(target, step)
  }  /**
   * Highlight an element with spotlight effect
   */
  private highlightElement(element: HTMLElement, shouldHighlight: boolean, step?: OnboardingStep): void {
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

      this.updateClipPath(element, backdrop, step)

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
  }  /**
   * Update the clip-path for the backdrop to create spotlight effect with border radius
   */
  private updateClipPath(element: HTMLElement, backdrop: HTMLElement, step?: OnboardingStep): void {
    const rect = element.getBoundingClientRect()

    // Get spotlight options from step or global config with explicit defaults
    const stepSpotlight = step?.spotlight
    const globalSpotlight = this.config.spotlight

    const borderRadius = stepSpotlight?.borderRadius ?? globalSpotlight.borderRadius
    const padding = stepSpotlight?.padding ?? globalSpotlight.padding

    // Backdrop opacity is always global (no per-step override)
    const opacity = globalSpotlight.backdropOpacity / 100
    backdrop.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`

    // Calculate coordinates with padding
    const x1 = Math.max(0, rect.left - padding)
    const y1 = Math.max(0, rect.top - padding)
    const x2 = Math.min(window.innerWidth, rect.right + padding)
    const y2 = Math.min(window.innerHeight, rect.bottom + padding)

    if (borderRadius > 0) {
      // Create rounded rectangle using SVG mask
      this.createRoundedSpotlight(backdrop, x1, y1, x2, y2, borderRadius)
    } else {
      // Clear any SVG content and restore original backdrop
      backdrop.innerHTML = ''
      backdrop.style.backdropFilter = 'blur(2px)'

      // Use simple polygon for sharp corners
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
  }  /**
   * Create a rounded spotlight effect using SVG mask for proper rounded corners
   */
  private createRoundedSpotlight(backdrop: HTMLElement, x1: number, y1: number, x2: number, y2: number, borderRadius: number): void {
    const width = x2 - x1
    const height = y2 - y1

    // Limit border radius to not exceed half of the smaller dimension
    const maxRadius = Math.min(width / 2, height / 2, borderRadius)

    // Clear any existing clip-path
    backdrop.style.clipPath = 'none'

    // Create SVG with rounded rectangle cutout
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.pointerEvents = 'none'

    const cutoutId = 'spotlight-cutout-' + Date.now()

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask.id = cutoutId

    // White background (visible area)
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    background.setAttribute('width', '100%')
    background.setAttribute('height', '100%')
    background.setAttribute('fill', 'white')

    // Black rounded rectangle (cutout area)
    const cutout = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    cutout.setAttribute('x', x1.toString())
    cutout.setAttribute('y', y1.toString())
    cutout.setAttribute('width', width.toString())
    cutout.setAttribute('height', height.toString())
    cutout.setAttribute('rx', maxRadius.toString())
    cutout.setAttribute('ry', maxRadius.toString())
    cutout.setAttribute('fill', 'black')

    mask.appendChild(background)
    mask.appendChild(cutout)
    defs.appendChild(mask)
    svg.appendChild(defs)

    // Apply the mask to create the backdrop effect
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', 'rgba(0, 0, 0, 0.7)')
    rect.setAttribute('mask', `url(#${cutoutId})`)

    svg.appendChild(rect)

    // Clear backdrop and add SVG
    backdrop.innerHTML = ''
    backdrop.appendChild(svg)
  }

  /**
   * Setup resize handler to update clip-path on window resize
   */
  private setupResizeHandler(): void {
    this.state.resizeHandler = () => {
      if (this.state.currentHighlightedElement && this.state.overlay && this.state.currentStepConfig) {
        const backdrop = this.state.overlay.querySelector('.guida-backdrop') as HTMLElement
        if (backdrop) {
          this.updateClipPath(this.state.currentHighlightedElement, backdrop, this.state.currentStepConfig)
        }
        // Also update tooltip position on resize
        if (this.state.tooltip && this.state.currentStepConfig) {
          this.showTooltip(this.state.currentHighlightedElement, this.state.currentStepConfig)
        }
      }
    }

    // Handle scroll events to keep spotlight in sync
    this.state.scrollHandler = () => {
      if (this.state.currentHighlightedElement && this.state.overlay && this.state.currentStepConfig) {
        const backdrop = this.state.overlay.querySelector('.guida-backdrop') as HTMLElement
        if (backdrop) {
          this.updateClipPath(this.state.currentHighlightedElement, backdrop, this.state.currentStepConfig)
        }
        // Also update tooltip position on scroll
        if (this.state.tooltip && this.state.currentStepConfig) {
          this.showTooltip(this.state.currentHighlightedElement, this.state.currentStepConfig)
        }
      }
    }

    window.addEventListener('resize', this.state.resizeHandler)
    window.addEventListener('scroll', this.state.scrollHandler, true) // Use capture to catch all scroll events
    document.addEventListener('scroll', this.state.scrollHandler, true) // Also listen on document for better coverage
  }

  /**
   * Show tooltip for the current step
   */
  private showTooltip(target: HTMLElement, step: OnboardingStep): void {
    if (!this.state.tooltip) return

    const rect = target.getBoundingClientRect()
    const tooltipWidth = 320

    const isFirstStep = this.state.currentStep === 0
    const isLastStep = this.state.currentStep === this.config.steps.length - 1

    // Update tooltip content first
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
          <div class="guida-controls">
            ${!isFirstStep ? '<button class="guida-btn guida-btn-secondary guida-prev">← Previous</button>' : ''}
            ${step.action === 'observe' && !isLastStep ? '<button class="guida-btn guida-next">Next →</button>' : ''}
            ${step.skipable ? '<button class="guida-btn guida-btn-text guida-skip">Skip</button>' : ''}
            <button class="guida-btn guida-btn-text guida-close">Close</button>
          </div>
        </div>
      </div>
      <div class="guida-arrow guida-arrow-${step.position}"></div>
    `

    // Set width and make visible temporarily to measure actual height
    this.state.tooltip.style.width = `${tooltipWidth}px`
    this.state.tooltip.style.visibility = 'hidden'
    this.state.tooltip.style.opacity = '1'
    this.state.tooltip.classList.add('guida-visible')

    // Get the actual height after content is rendered
    const tooltipHeight = this.state.tooltip.offsetHeight

    // Now calculate position with the correct height
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

    // Apply final position and make visible
    this.state.tooltip.style.left = `${left}px`
    this.state.tooltip.style.top = `${top}px`
    this.state.tooltip.style.visibility = 'visible'

    // Setup event listeners to tooltip buttons
    this.setupTooltipEvents()
  }

  /**
   * Setup event listeners for tooltip buttons
   */
  private setupTooltipEvents(): void {
    if (!this.state.tooltip) return

    const prevBtn = this.state.tooltip.querySelector('.guida-prev') as HTMLButtonElement
    const skipBtn = this.state.tooltip.querySelector('.guida-skip') as HTMLButtonElement
    const nextBtn = this.state.tooltip.querySelector('.guida-next') as HTMLButtonElement
    const closeBtn = this.state.tooltip.querySelector('.guida-close') as HTMLButtonElement

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStep())
    }

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
    const currentStep = this.config.steps[this.state.currentStep]
    this.state.currentStep++
    this.hideTooltip()

    // Emit navigation event
    this.emit('stepNavigation', {
      direction: 'next',
      fromStep: this.state.currentStep - 1,
      toStep: this.state.currentStep,
      fromStepConfig: currentStep
    })

    setTimeout(() => {
      this.showStep(this.state.currentStep)
    }, 300)
  }

  /**
   * Move to the previous step
   */
  public previousStep(): void {
    if (this.state.currentStep > 0) {
      const currentStep = this.config.steps[this.state.currentStep]
      this.state.currentStep--
      this.hideTooltip()

      // Emit navigation event
      this.emit('stepNavigation', {
        direction: 'previous',
        fromStep: this.state.currentStep + 1,
        toStep: this.state.currentStep,
        fromStepConfig: currentStep
      })

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

    // Remove scroll handler
    if (this.state.scrollHandler) {
      window.removeEventListener('scroll', this.state.scrollHandler, true)
      document.removeEventListener('scroll', this.state.scrollHandler, true)
      this.state.scrollHandler = null
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
    this.state.currentStepConfig = null
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
