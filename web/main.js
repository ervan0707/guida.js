import { SpotlightOnboarding } from "../src/index.ts";

const tourSteps = [
  {
    target: "#spotlightFeature",
    title: "Element highlighting",
    description:
      "This feature lets you spotlight any element on your page with a backdrop overlay that follows the element as it moves.",
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
    title: "TypeScript support",
    description:
      "Full type definitions are included so you get autocomplete and type checking in your editor.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: true,
  },
  {
    target: "#userForm",
    title: "Demo form",
    description:
      "This is a sample form to demonstrate how guida.js can highlight interactive elements in your app.",
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
    title: "Interactive elements",
    description:
      "Click on this input field to see how guida.js handles user interactions and advances to the next step.",
    position: "right",
    action: "click",
    highlight: true,
    skipable: false,
  },
  {
    target: "#helpButton",
    title: "Documentation",
    description:
      "Visit the GitHub repository for full documentation, examples, and source code.",
    position: "top",
    action: "observe",
    highlight: true,
    skipable: false,
  },
];

const onboarding = new SpotlightOnboarding({
  steps: tourSteps,
  autoStart: false,
  startDelay: 500,
  storageKey: "guida-landing-tour",
  spotlight: {
    borderRadius: 12,
    padding: 10,
    backdropOpacity: 60,
  },
  callbacks: {
    onStart: () => {
      console.log("🎯 Tour started!");
      showStatus("🎯 Tour started! Click through to see how it works", "info");
    },
    onComplete: () => {
      console.log("🎉 Tour completed!");
      showStatus(
        "🎉 Tour completed! Ready to use guida.js in your project?",
        "success"
      );
    },
    onClose: () => {
      console.log("👋 Tour closed");
      showStatus("👋 Tour closed. Click 'Start Tour' to try again", "info");
    },
    onStepChange: (stepIndex, step) => {
      console.log(`📍 Step ${stepIndex + 1}: ${step.title}`);
      updateProgress(stepIndex + 1, tourSteps.length);
    },
  },
});

function showStatus(message, type = "info") {
  console.log(message);

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

// Theme selector functionality
function setupThemeSelector() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeSelector = document.getElementById("themeSelector");
  const themeOptions = document.querySelectorAll(".theme-option");
  const html = document.documentElement;

  // Get saved theme from localStorage or default to frappe
  const savedTheme = localStorage.getItem("guida-theme") || "frappe";
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

  html.setAttribute("data-theme", theme);

  themeOptions.forEach((option) => {
    if (option.dataset.theme === theme) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

// Form interaction enhancements
function setupFormInteractions() {
  const form = document.getElementById("userForm");
  const inputs = form.querySelectorAll("input");

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

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("copyright-year").textContent =
    new Date().getFullYear();

  // Setup interactive elements
  setupFormInteractions();
  setupThemeSelector();

  // Event listeners for demo controls
  const startTourBtn = document.getElementById("startTour");
  const heroStartBtn = document.getElementById("heroStartTour");
  const restartTourBtn = document.getElementById("restartTour");

  if (startTourBtn) {
    startTourBtn.addEventListener("click", () => {
      onboarding.start();
    });
  }

  if (heroStartBtn) {
    heroStartBtn.addEventListener("click", () => {
      // Smooth scroll to demo section then start tour
      document.querySelector(".demo").scrollIntoView({
        behavior: "smooth",
      });
      setTimeout(() => {
        onboarding.start();
      }, 800);
    });
  }

  if (restartTourBtn) {
    restartTourBtn.addEventListener("click", () => {
      onboarding.restart();
    });
  }

  if (!onboarding.isCompleted()) {
    showStatus("👋 Welcome! Try the demo to see guida.js in action", "info");
  }
});

window.guida = onboarding;
