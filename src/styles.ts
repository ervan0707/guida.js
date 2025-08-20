export const DEFAULT_STYLES = `
/* Guida.js Onboarding Styles */
.guida-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  pointer-events: none;
}

.guida-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  transition: clip-path 0.3s ease-in-out;
}

.guida-highlight {
  position: relative;
  z-index: 10001;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
}

.guida-highlight::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid #007acc;
  border-radius: 12px;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2),
              0 0 20px rgba(0, 122, 204, 0.3);
  pointer-events: none;
  z-index: -1;
  animation: guida-pulse 2s infinite;
}

@keyframes guida-pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2),
                0 0 20px rgba(0, 122, 204, 0.3);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.4),
                0 0 30px rgba(0, 122, 204, 0.5);
  }
}

.guida-tooltip {
  position: fixed;
  z-index: 10002;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 0;
  opacity: 0;
  transform: scale(0.9) translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 400px;
  min-width: 300px;
}

.guida-tooltip.guida-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.guida-tooltip-content {
  padding: 24px;
}

.guida-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.guida-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.guida-progress {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.guida-tooltip-content p {
  margin: 0 0 20px 0;
  color: #4a4a4a;
  line-height: 1.5;
  font-size: 14px;
}

.guida-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.guida-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
}

.guida-skip {
  background: transparent;
  color: #666;
  border: 1px solid #ddd !important;
}

.guida-skip:hover {
  background: #f5f5f5;
  border-color: #ccc !important;
}

.guida-next {
  background: #007acc;
  color: white;
}

.guida-next:hover {
  background: #005a99;
  transform: translateY(-1px);
}

.guida-close {
  background: #dc3545;
  color: white;
}

.guida-close:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Tooltip arrows */
.guida-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

.guida-arrow-top {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: white;
}

.guida-arrow-bottom {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: white;
}

.guida-arrow-left {
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: white;
}

.guida-arrow-right {
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: white;
}

/* Completion styles */
.guida-completion {
  text-align: center;
}

.guida-completion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.guida-completion h3 {
  color: #28a745;
  margin-bottom: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .guida-tooltip {
    max-width: calc(100vw - 40px);
    min-width: 280px;
  }
  
  .guida-tooltip-content {
    padding: 20px;
  }
  
  .guida-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .guida-actions {
    flex-direction: column;
  }
  
  .guida-btn {
    width: 100%;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .guida-tooltip {
    background: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .guida-header h3 {
    color: #ffffff;
  }
  
  .guida-tooltip-content p {
    color: #cccccc;
  }
  
  .guida-progress {
    background: #404040;
    color: #cccccc;
  }
  
  .guida-skip {
    background: transparent;
    color: #cccccc;
    border-color: #555 !important;
  }
  
  .guida-skip:hover {
    background: #404040;
    border-color: #666 !important;
  }
  
  .guida-arrow-top {
    border-top-color: #2d2d2d;
  }
  
  .guida-arrow-bottom {
    border-bottom-color: #2d2d2d;
  }
  
  .guida-arrow-left {
    border-left-color: #2d2d2d;
  }
  
  .guida-arrow-right {
    border-right-color: #2d2d2d;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .guida-backdrop {
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  .guida-highlight::before {
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(255, 255, 255, 0.8);
  }
  
  .guida-tooltip {
    border: 2px solid #000000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .guida-backdrop,
  .guida-tooltip,
  .guida-highlight,
  .guida-btn {
    transition: none;
  }
  
  .guida-highlight::before {
    animation: none;
  }
}
`
