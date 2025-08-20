// Import the library from the source (for development)
import { SpotlightOnboarding } from "../src/index.ts";

// Example onboarding configuration
const onboardingSteps = [
  {
    target: "#welcomeCard",
    title: "Welcome to the Demo!",
    description:
      "This is your first stop. Here you can see the main welcome message and get started with the application.",
    position: "bottom",
    action: "observe",
    highlight: true,
    skipable: false,
    spotlight: {
      borderRadius: 16,
      padding: 0,
    },
  },
  {
    target: "#startTour",
    title: "Start Tour Button",
    description:
      "This button starts the onboarding tour. Click it anytime to restart the experience.",
    position: "bottom",
    action: "observe",
    highlight: true,
    skipable: true,
    spotlight: {
      borderRadius: 20,
      padding: 8,
    },
  },
  {
    target: "#featuresCard",
    title: "Key Features",
    description:
      "This card highlights the main features of the application. Users can quickly see what makes your app special.",
    position: "left",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#userForm",
    title: "📝 User Profile Form",
    description:
      "Help users understand how to fill out their profile information. This is crucial for personalization.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#userName",
    title: "👤 Name Field",
    description:
      "Click here to enter your name. This will be used throughout the application to personalize your experience.",
    position: "right",
    action: "click",
    highlight: true,
    skipable: false,
  },
  {
    target: "#settingsPanel",
    title: "⚙️ Settings Panel",
    description:
      "This is where users can customize their experience. Show them the most important settings first.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#darkModeToggle",
    title: "🌙 Dark Mode Toggle",
    description:
      "Users love customization! Show them how to switch between light and dark themes.",
    position: "right",
    action: "click",
    highlight: true,
    skipable: true,
  },
  {
    target: "#helpButton",
    title: "❓ Help & Support",
    description:
      "Always end your tour by showing users where to get help. This builds confidence in your support.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: false,
  },
];

// Create onboarding instance
const onboarding = new SpotlightOnboarding({
  steps: onboardingSteps,
  autoStart: false, // We'll start it manually
  startDelay: 500,
  spotlight: {
    borderRadius: 12, // Default border radius for all steps
    padding: 10, // Default padding for all steps
    backdropOpacity: 50, // Default backdrop opacity (50%)
  },
  callbacks: {
    onStart: () => {
      console.log("🎯 Onboarding started!");
      updateStatus("Onboarding started");
    },
    onComplete: () => {
      console.log("🎉 Onboarding completed!");
      updateStatus("Onboarding completed! Welcome aboard!");
    },
    onClose: () => {
      console.log("👋 Onboarding closed");
      updateStatus("Onboarding closed");
    },
    onStepChange: (stepIndex, step) => {
      console.log(`📍 Step ${stepIndex + 1}: ${step.title}`);
      updateStatus(`Step ${stepIndex + 1}: ${step.title}`);
    },
  },
});

// Add event listeners for demo controls
document.addEventListener("DOMContentLoaded", () => {
  // Start tour button
  const startTourBtn = document.getElementById("startTour");
  if (startTourBtn) {
    startTourBtn.addEventListener("click", () => {
      onboarding.start();
    });
  }

  // Restart tour button
  const restartTourBtn = document.getElementById("restartTour");
  if (restartTourBtn) {
    restartTourBtn.addEventListener("click", () => {
      onboarding.restart();
    });
  }

  // Reset progress button
  const resetProgressBtn = document.getElementById("resetProgress");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      onboarding.reset();
      updateStatus(
        "Progress reset - tour will start automatically on next visit"
      );
    });
  }

  // Toggle switches functionality
  setupToggleSwitches();

  // Auto-start if not completed
  if (!onboarding.isCompleted()) {
    setTimeout(() => {
      onboarding.start();
    }, 1000);
  } else {
    updateStatus(
      'Welcome back! Click "Restart Tour" to see the onboarding again.'
    );
  }
});

// Setup toggle switches
function setupToggleSwitches() {
  const toggles = document.querySelectorAll(".toggle-switch");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");

      if (toggle.id === "darkModeToggle") {
        // Demo dark mode toggle
        document.body.style.filter = toggle.classList.contains("active")
          ? "invert(1) hue-rotate(180deg)"
          : "none";
      }
    });
  });
}

// Status update helper
function updateStatus(message) {
  // Create status element if it doesn't exist
  let statusEl = document.getElementById("status-message");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.id = "status-message";
    statusEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      max-width: 300px;
      word-wrap: break-word;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(statusEl);
  }

  statusEl.textContent = message;
  statusEl.style.opacity = "1";
  statusEl.style.transform = "translateY(0)";

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.style.opacity = "0";
    statusEl.style.transform = "translateY(-20px)";
  }, 3000);
}

// Expose onboarding instance to global scope for debugging
window.guidaOnboarding = onboarding;
