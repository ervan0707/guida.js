import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock window.getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
})) as any

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})
global.cancelAnimationFrame = vi.fn()

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})
