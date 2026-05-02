const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const resetChat = document.getElementById("resetChat");
const startEligibility = document.getElementById("startEligibility");
const faqSteps = document.getElementById("faqSteps");
const startBooth = document.getElementById("startBooth");

const state = {
  lastIntent: null,
  age: null,
  citizen: null,
  location: null,
  pendingQuestion: null
};

const intentMap = {
  eligibility: ["eligible", "eligibility", "can i vote", "am i eligible", "check eligibility"],
  steps: ["how to vote", "voting steps", "process", "vote"],
  documents: ["documents", "id", "identification", "requirements", "proof"],
  polling: ["polling", "booth", "where do i vote", "find polling", "polling station"],
  reminder: ["reminder", "calendar", "schedule", "alert"],
  faq: ["faq", "questions", "help"]
};

const boothList = [
  "Central Civic Hall",
  "Riverside Community Center",
  "Northview Library",
  "Greenwood High Gym",
  "Downtown Municipal Plaza"
];

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addMessage(role, text, meta = "", allowHtml = false) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  const content = document.createElement("div");
  if (allowHtml) {
    content.innerHTML = text;
  } else {
    content.textContent = text;
  }
  bubble.appendChild(content);
  if (meta) {
    const metaEl = document.createElement("div");
    metaEl.className = "meta";
    metaEl.textContent = meta;
    bubble.appendChild(metaEl);
  }
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;

  if (window.gsap) {
    gsap.fromTo(bubble, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }
}

function greet() {
  addMessage(
    "assistant",
    "<strong>Welcome!</strong> I can help you understand the election process. Ask about eligibility, voting steps, documents, or polling booths.",
    "Assistant",
    true
  );
  addMessage(
    "assistant",
    "Try: <em>Am I eligible?</em>, <em>How do I vote?</em>, or <em>Find polling booth</em>.",
    "Assistant",
    true
  );
}

function detectIntent(text) {
  const normalized = text.toLowerCase();
  for (const [intent, keys] of Object.entries(intentMap)) {
    if (keys.some((key) => normalized.includes(key))) {
      return intent;
    }
  }
  return "general";
}

function parseAge(text) {
  const match = text.match(/\b(\d{1,3})\b/);
  if (!match) {
    return null;
  }
  const ageValue = Number.parseInt(match[1], 10);
  if (Number.isNaN(ageValue) || ageValue <= 0 || ageValue > 120) {
    return null;
  }
  return ageValue;
}

function parseYesNo(text) {
  const normalized = text.trim().toLowerCase();
  if (["yes", "yep", "yeah", "y"].includes(normalized)) {
    return true;
  }
  if (["no", "nope", "nah", "n"].includes(normalized)) {
    return false;
  }
  return null;
}

function askEligibilityQuestions() {
  if (state.age === null) {
    state.pendingQuestion = "age";
    addMessage("assistant", "What is your age?", "Eligibility");
    return;
  }
  if (state.citizen === null) {
    state.pendingQuestion = "citizenship";
    addMessage("assistant", "Are you a citizen of the country where you want to vote? (yes/no)", "Eligibility");
    return;
  }
  provideEligibilityResult();
}

function provideEligibilityResult() {
  const isEligible = state.age >= 18 && state.citizen === true;
  const decision = isEligible
    ? "Based on what you shared, you are <strong>eligible</strong> to vote."
    : "Based on what you shared, you are <strong>not eligible</strong> to vote.";
  const reasoning =
    "Eligibility is determined by age (18 or older) and citizenship status.";
  addMessage("assistant", `${decision}<br/>${reasoning}`, "Eligibility", true);
  suggestNextSteps("eligibility");
}

function provideVotingSteps() {
  addMessage(
    "assistant",
    "Here are the usual voting steps:<ol><li>Check your eligibility and registration status.</li><li>Find your polling location.</li><li>Bring required identification documents.</li><li>Cast your vote following on-site instructions.</li><li>Keep your receipt or confirmation if provided.</li></ol>",
    "Steps",
    true
  );
  suggestNextSteps("steps");
}

function provideDocumentsInfo() {
  addMessage(
    "assistant",
    "Common documents can include a government-issued ID and proof of address. Requirements vary by location, so confirm with your local election authority.",
    "Documents",
    true
  );
  suggestNextSteps("documents");
}

function askLocation() {
  state.pendingQuestion = "location";
  addMessage("assistant", "Which city or neighborhood should I search near?", "Polling Booths");
}

function buildMapsLink(location) {
  const encoded = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function buildCalendarLink(location) {
  const title = encodeURIComponent("Election day reminder");
  const details = encodeURIComponent(`Remember to vote near ${location || "your polling location"}.`);
  const dates = encodeURIComponent("20261103T120000Z/20261103T130000Z");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

function provideBooths(location) {
  const safeLocation = escapeHtml(location);
  const booths = boothList
    .map((name) => `<li>${escapeHtml(name)} - near ${safeLocation}</li>`)
    .join("");
  const mapsLink = buildMapsLink(location);
  addMessage(
    "assistant",
    `Here are mock polling booths near <strong>${safeLocation}</strong>:<ul>${booths}</ul><p><a href="${mapsLink}" target="_blank" rel="noopener">Open in Google Maps</a></p>`,
    "Polling Booths",
    true
  );
  suggestNextSteps("polling");
}

function provideReminder() {
  addMessage(
    "assistant",
    "I can add a reminder. What date should I add to your calendar?",
    "Reminder"
  );
  state.pendingQuestion = "reminder";
}

function confirmReminder(dateText) {
  const safeDate = escapeHtml(dateText);
  const calendarLink = buildCalendarLink(state.location);
  addMessage(
    "assistant",
    `Reminder planned for <strong>${safeDate}</strong>. <a href="${calendarLink}" target="_blank" rel="noopener">Create Google Calendar event</a>`,
    "Reminder",
    true
  );
  suggestNextSteps("reminder");
}

function suggestNextSteps(intent) {
  const suggestions = {
    eligibility: "Want help finding your polling booth or voting steps?",
    steps: "Need document requirements or a polling booth finder?",
    documents: "Want to check eligibility or find your polling booth?",
    polling: "Would you like a reminder or voting steps?",
    reminder: "Need eligibility or document info?"
  };
  if (suggestions[intent]) {
    addMessage("assistant", suggestions[intent], "Suggestions");
  }
}

function handlePendingAnswer(input) {
  if (state.pendingQuestion === "age") {
    const ageValue = Number.parseInt(input, 10);
    if (Number.isNaN(ageValue) || ageValue <= 0 || ageValue > 120) {
      addMessage("assistant", "Please share a valid age.", "Eligibility");
      return true;
    }
    state.age = ageValue;
    state.pendingQuestion = null;
    askEligibilityQuestions();
    return true;
  }

  if (state.pendingQuestion === "citizenship") {
    const answer = parseYesNo(input);
    if (answer === null) {
      addMessage("assistant", "Please answer with yes or no.", "Eligibility");
      return true;
    }
    state.citizen = answer;
    state.pendingQuestion = null;
    provideEligibilityResult();
    return true;
  }

  if (state.pendingQuestion === "location") {
    const location = input.trim();
    if (!location) {
      addMessage("assistant", "Please share a location to search near.", "Polling Booths");
      return true;
    }
    state.location = location;
    state.pendingQuestion = null;
    provideBooths(location);
    return true;
  }

  if (state.pendingQuestion === "reminder") {
    const dateText = input.trim();
    if (!dateText) {
      addMessage("assistant", "Please share a date for the reminder.", "Reminder");
      return true;
    }
    state.pendingQuestion = null;
    confirmReminder(dateText);
    return true;
  }

  return false;
}

function handleIntent(intent, rawText = "") {
  switch (intent) {
    case "eligibility":
      state.lastIntent = intent;
      askEligibilityQuestions();
      break;
    case "steps":
      state.lastIntent = intent;
      provideVotingSteps();
      break;
    case "documents":
      state.lastIntent = intent;
      provideDocumentsInfo();
      break;
    case "polling":
      state.lastIntent = intent;
      if (state.location) {
        provideBooths(state.location);
      } else {
        askLocation();
      }
      break;
    case "reminder":
      state.lastIntent = intent;
      provideReminder();
      break;
    case "faq":
      state.lastIntent = intent;
      provideVotingSteps();
      break;
    default:
      if (state.lastIntent === "eligibility" && (state.age === null || state.citizen === null)) {
        askEligibilityQuestions();
        return;
      }
      addMessage(
        "assistant",
        "I can help with eligibility, voting steps, required documents, polling booths, or reminders. What would you like to know?",
        "Assistant"
      );
  }
}

function handleFreeformFacts(input) {
  if (state.pendingQuestion) {
    return false;
  }
  let updated = false;
  const ageValue = parseAge(input);
  if (ageValue !== null && state.age === null) {
    state.age = ageValue;
    updated = true;
  }
  const citizenValue = parseYesNo(input);
  if (citizenValue !== null && state.citizen === null) {
    state.citizen = citizenValue;
    updated = true;
  }
  if (updated && state.lastIntent === "eligibility") {
    askEligibilityQuestions();
    return true;
  }
  return false;
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = userInput.value.trim();
  if (!input) {
    return;
  }
  addMessage("user", input, "You");
  userInput.value = "";

  if (handlePendingAnswer(input)) {
    return;
  }

  if (handleFreeformFacts(input)) {
    return;
  }

  const intent = detectIntent(input);
  handleIntent(intent, input);
});

resetChat.addEventListener("click", () => {
  chatLog.innerHTML = "";
  state.lastIntent = null;
  state.age = null;
  state.citizen = null;
  state.location = null;
  state.pendingQuestion = null;
  greet();
});

startEligibility.addEventListener("click", () => {
  addMessage("user", "Am I eligible to vote?", "Quick Action");
  handleIntent("eligibility");
});

faqSteps.addEventListener("click", () => {
  addMessage("user", "How do I vote?", "Quick Action");
  handleIntent("steps");
});

startBooth.addEventListener("click", () => {
  addMessage("user", "Find polling booth", "Quick Action");
  handleIntent("polling");
});

function runAnimations() {
  if (!window.gsap) {
    return;
  }
  gsap.from(".topbar", { y: -24, opacity: 0, duration: 0.6, ease: "power2.out" });
  gsap.from(".chat", { y: 24, opacity: 0, duration: 0.6, delay: 0.1, ease: "power2.out" });
  gsap.from(".card", {
    y: 18,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.08,
    delay: 0.2
  });
  gsap.to(".orb-one", { y: 18, x: -10, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".orb-two", { y: -22, x: 12, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
  const buttons = document.querySelectorAll(".primary, .secondary, .ghost");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, { y: -2, duration: 0.2, ease: "power2.out" });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, { y: 0, duration: 0.2, ease: "power2.out" });
    });
  });
}

function loadGsapAndRun() {
  if (window.gsap) {
    runAnimations();
    return;
  }
  const fallback = document.createElement("script");
  fallback.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
  fallback.onload = () => runAnimations();
  fallback.onerror = () => {
    addMessage("assistant", "Animations are disabled because GSAP failed to load.", "System");
  };
  document.head.appendChild(fallback);
}

greet();
loadGsapAndRun();
