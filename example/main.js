// Import the library from the source (for development)
import { SpotlightOnboarding } from "../src/index.ts";

// Modern landing page onboarding configuration
const onboardingSteps = [
  {
    target: "#spotlightFeature",
    title: "✨ Smart Spotlight Technology",
    description:
      "Our intelligent highlighting system automatically follows elements during scroll and resize, ensuring your users never lose focus.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
    spotlight: {
      borderRadius: 16,
      padding: 8,
    },
  },
  {
    target: "#typescriptFeature",
    title: "⚡ Built for Modern Development",
    description:
      "TypeScript-first design means better developer experience, excellent IDE support, and fewer runtime errors.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#welcomeCard",
    title: "🎉 Interactive Demo Cards",
    description:
      "These demo cards represent different sections of your application. Notice how the spotlight perfectly frames each element.",
    position: "right",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#userForm",
    title: "📝 Form Integration Example",
    description:
      "Guide users through form completion with contextual tips. Perfect for onboarding flows and feature adoption.",
    position: "left",
    action: "observe",
    highlight: true,
    skipable: true,
    spotlight: {
      borderRadius: 16,
      padding: 16,
    },
  },
  {
    target: "#userName",
    title: "👤 Interactive Elements",
    description:
      "Click on this input field to see how Guida.js handles user interactions and progresses through steps.",
    position: "right",
    action: "click",
    highlight: true,
    skipable: false,
  },
  {
    target: "#helpButton",
    title: "❓ Support & Documentation",
    description:
      "Always end your onboarding by showing users where to get help. This builds confidence and reduces support tickets.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: false,
  },
];

// Quick demo steps for faster showcase
const quickDemoSteps = [
  {
    target: "#spotlightFeature",
    title: "🎯 Quick Demo - Smart Spotlight",
    description:
      "This is a condensed version showing key features. Perfect for users who want a quick overview.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#userName",
    title: "⚡ Interactive Elements",
    description: "Click here to see smooth transitions between steps.",
    position: "right",
    action: "click",
    highlight: true,
    skipable: false,
  },
  {
    target: "#helpButton",
    title: "🚀 Ready to Get Started?",
    description:
      "That's it! You've seen the key features. Ready to integrate Guida.js into your project?",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
];

// Create onboarding instances
const fullOnboarding = new SpotlightOnboarding({
  steps: onboardingSteps,
  autoStart: false,
  startDelay: 500,
  storageKey: "guida-landing-full-tour",
  spotlight: {
    borderRadius: 12,
    padding: 10,
    backdropOpacity: 60,
  },
  callbacks: {
    onStart: () => {
      console.log("🎯 Full tour started!");
      showStatus("🎯 Full tour started! Experience all features", "info");
    },
    onComplete: () => {
      console.log("🎉 Full tour completed!");
      showStatus(
        "🎉 Congratulations! You've completed the full tour",
        "success"
      );
    },
    onClose: () => {
      console.log("👋 Tour closed");
      showStatus("👋 Tour closed. Click any button to start again", "info");
    },
    onStepChange: (stepIndex, step) => {
      console.log(`📍 Step ${stepIndex + 1}: ${step.title}`);
      // showStatus(`📍 Step ${stepIndex + 1}: ${step.title}`, "info");
      updateProgress(stepIndex + 1, onboardingSteps.length);
    },
  },
});

const quickOnboarding = new SpotlightOnboarding({
  steps: quickDemoSteps,
  autoStart: false,
  startDelay: 300,
  storageKey: "guida-landing-quick-demo",
  spotlight: {
    borderRadius: 16,
    padding: 8,
    backdropOpacity: 50,
  },
  callbacks: {
    onStart: () => {
      showStatus(
        "⚡ Quick demo started! Fast overview of key features",
        "info"
      );
    },
    onComplete: () => {
      showStatus(
        "✨ Quick demo complete! Try the full tour for more",
        "success"
      );
    },
    onClose: () => {
      showStatus("Demo closed. Ready for another round?", "info");
    },
    onStepChange: (stepIndex, step) => {
      // showStatus(`⚡ Step ${stepIndex + 1}: ${step.title}`, "info");
      updateProgress(stepIndex + 1, quickDemoSteps.length);
    },
  },
});

// Enhanced status system with better UX
function showStatus(message, type = "info") {
  console.log(message);
  // Remove existing status
  const existing = document.querySelector(".status-indicator");
  if (existing) {
    existing.remove();
  }

  const statusEl = document.createElement("div");
  statusEl.className = `status-indicator status-${type}`;
  statusEl.textContent = message;

  document.body.appendChild(statusEl);

  // Trigger show animation
  setTimeout(() => statusEl.classList.add("show"), 100);

  // Auto-hide after 4 seconds
  setTimeout(() => {
    statusEl.classList.remove("show");
    setTimeout(() => statusEl.remove(), 300);
  }, 4000);
}

// Progress indicator
function updateProgress(current, total) {
  const progressText = `Step ${current} of ${total}`;
  showStatus(progressText, "info");
}

// Enhanced toggle functionality with animations
function setupToggleSwitches() {
  const toggles = document.querySelectorAll(".toggle-switch");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const wasActive = toggle.classList.contains("active");
      toggle.classList.toggle("active");

      // subtle animation feedback
      toggle.style.transform = "scale(0.95)";
      setTimeout(() => {
        toggle.style.transform = "scale(1)";
      }, 100);

      // Handle specific toggle actions
      if (toggle.id === "contrastToggle") {
        handleContrastToggle(!wasActive);
      } else if (toggle.id === "notificationsToggle") {
        showStatus(
          !wasActive ? "🔔 Notifications enabled" : "🔕 Notifications disabled",
          "info"
        );
      }
    });
  });
}

// Theme selector functionality for all 4 Catppuccin flavors
function setupThemeSelector() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeSelector = document.getElementById("themeSelector");
  const themeOptions = document.querySelectorAll(".theme-option");
  const html = document.documentElement;

  // Get saved theme from localStorage or default to mocha
  const savedTheme = localStorage.getItem("guida-theme") || "mocha";
  setTheme(savedTheme);

  // Toggle theme selector visibility
  themeToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    themeSelector.classList.toggle("show");
  });

  // Close theme selector when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !themeSelector.contains(e.target) &&
      !themeToggleBtn.contains(e.target)
    ) {
      themeSelector.classList.remove("show");
    }
  });

  // Handle theme option clicks
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const newTheme = option.dataset.theme;
      setTheme(newTheme);
      localStorage.setItem("guida-theme", newTheme);

      // Update active state
      themeOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");

      // Hide selector after selection
      themeSelector.classList.remove("show");

      // Show status message
      const themeNames = {
        latte: "☀️ Latte (Light)",
        frappe: "🌆 Frappé (Dark)",
        macchiato: "🌃 Macchiato (Dark)",
        mocha: "🌙 Mocha (Dark)",
      };

      showStatus(`${themeNames[newTheme]} theme activated`, "info");
    });
  });
}

function setTheme(theme) {
  const html = document.documentElement;
  const themeOptions = document.querySelectorAll(".theme-option");

  // Set the data-theme attribute
  html.setAttribute("data-theme", theme);

  // Update active state in selector
  themeOptions.forEach((option) => {
    if (option.dataset.theme === theme) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

// High contrast mode
function handleContrastToggle(enabled) {
  if (enabled) {
    document.body.style.filter =
      (document.body.style.filter || "") + " contrast(1.5) saturate(1.2)";
    showStatus("🎨 High contrast enabled", "info");
  } else {
    document.body.style.filter = document.body.style.filter.replace(
      "contrast(1.5) saturate(1.2)",
      ""
    );
    showStatus("🎨 Normal contrast restored", "info");
  }
}

// Form interaction enhancements
function setupFormInteractions() {
  const form = document.getElementById("userForm");
  const inputs = form.querySelectorAll("input, select");

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.style.transform = "scale(1.02)";
      input.parentElement.style.transition = "transform 0.2s ease";
    });

    input.addEventListener("blur", () => {
      input.parentElement.style.transform = "scale(1)";
    });
  });
}

// Card hover enhancements
function setupCardAnimations() {
  const cards = document.querySelectorAll(".demo-card, .feature-card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  // Setup all interactive elements
  setupToggleSwitches();
  setupFormInteractions();
  setupCardAnimations();
  setupThemeSelector();

  // Event listeners for demo controls
  const startTourBtn = document.getElementById("startTour");
  const quickDemoBtn = document.getElementById("quickDemo");
  const heroStartBtn = document.getElementById("heroStartTour");
  const restartTourBtn = document.getElementById("restartTour");
  const resetProgressBtn = document.getElementById("resetProgress");

  if (startTourBtn) {
    startTourBtn.addEventListener("click", () => {
      fullOnboarding.start();
    });
  }

  if (quickDemoBtn) {
    quickDemoBtn.addEventListener("click", () => {
      quickOnboarding.start();
    });
  }

  if (heroStartBtn) {
    heroStartBtn.addEventListener("click", () => {
      // Smooth scroll to demo section then start tour
      document.querySelector(".demo").scrollIntoView({
        behavior: "smooth",
      });
      setTimeout(() => {
        fullOnboarding.start();
      }, 800);
    });
  }

  if (restartTourBtn) {
    restartTourBtn.addEventListener("click", () => {
      fullOnboarding.restart();
    });
  }

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      fullOnboarding.reset();
      quickOnboarding.reset();
      showStatus(
        "🔄 Progress reset! Tours will auto-start on next visit",
        "success"
      );
    });
  }

  // Auto-start logic for new visitors
  if (!fullOnboarding.isCompleted()) {
    showStatus(
      "👋 Welcome! Click 'Start Full Tour' to explore Guida.js features",
      "info"
    );
  } else {
    showStatus("🎉 Welcome back! Ready to explore Guida.js again?", "success");
  }

  // subtle entrance animations
  setTimeout(() => {
    document.querySelectorAll(".feature-card").forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });
  }, 500);
});

// Expose instances for debugging
window.guidaFull = fullOnboarding;
window.guidaQuick = quickOnboarding;

// some initial styling for animations
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    .feature-card {
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s ease;
    }
  `;
  document.head.appendChild(style);
});
