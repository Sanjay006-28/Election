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
  eligibility: ["eligible", "eligibility", "can i vote", "am i eligible"],
  steps: ["how to vote", "voting steps", "process", "vote"],
  documents: ["documents", "id", "identification", "requirements"],
  polling: ["polling", "booth", "where do i vote", "find polling"],
  reminder: ["reminder", "calendar", "schedule"],
  faq: ["faq", "questions"]
};

const boothList = [
  "Central Civic Hall",
  "Riverside Community Center",
  "Northview Library",
  "Greenwood High Gym",
  "Downtown Municipal Plaza"
];

function addMessage(role, text, meta = "") {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  const content = document.createElement("div");
  content.innerHTML = text;
  bubble.appendChild(content);
  if (meta) {
    const metaEl = document.createElement("div");
    metaEl.className = "meta";
    metaEl.textContent = meta;
    bubble.appendChild(metaEl);
  }
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function greet() {
  addMessage(
    "assistant",
    "<strong>Welcome!</strong> I can help you understand the election process. Ask about eligibility, voting steps, documents, or polling booths.",
    "Assistant"
  );
  addMessage(
    "assistant",
    "Try: <em>Am I eligible?</em>, <em>How do I vote?</em>, or <em>Find polling booth</em>.",
    "Assistant"
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
  const result = isEligible
    ? "Based on what you shared, you are <strong>eligible</strong> to vote."
    : "Based on what you shared, you are <strong>not eligible</strong> to vote.";
  const reasoning =
    "Eligibility is determined by age (18 or older) and citizenship status.";
  addMessage("assistant", `${result}<br/>${reasoning}`, "Eligibility");
  suggestNextSteps("eligibility");
}

function provideVotingSteps() {
  addMessage(
    "assistant",
    "Here are the usual voting steps:<ol><li>Check your eligibility and registration status.</li><li>Find your polling location.</li><li>Bring required identification documents.</li><li>Cast your vote following on-site instructions.</li><li>Keep your receipt or confirmation if provided.</li></ol>",
    "Steps"
  );
  suggestNextSteps("steps");
}

function provideDocumentsInfo() {
  addMessage(
    "assistant",
    "Common documents can include a government-issued ID and proof of address. Requirements vary by location, so confirm with your local election authority.",
    "Documents"
  );
  suggestNextSteps("documents");
}

function askLocation() {
  state.pendingQuestion = "location";
  addMessage("assistant", "Which city or neighborhood should I search near?", "Polling Booths");
}

function provideBooths(location) {
  const booths = boothList.map((name) => `<li>${name} - near ${location}</li>`).join("");
  addMessage(
    "assistant",
    `Here are mock polling booths near <strong>${location}</strong>:<ul>${booths}</ul>`,
    "Polling Booths"
  );
  suggestNextSteps("polling");
}

function provideReminder() {
  addMessage(
    "assistant",
    "I can set a reminder. What date should I add to your calendar?",
    "Reminder"
  );
  state.pendingQuestion = "reminder";
}

function confirmReminder(dateText) {
  addMessage(
    "assistant",
    `Reminder added for <strong>${dateText}</strong>. (Simulated Google Calendar entry)`,
    "Reminder"
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
    if (Number.isNaN(ageValue) || ageValue <= 0) {
      addMessage("assistant", "Please share a valid age.", "Eligibility");
      return true;
    }
    state.age = ageValue;
    state.pendingQuestion = null;
    askEligibilityQuestions();
    return true;
  }

  if (state.pendingQuestion === "citizenship") {
    const normalized = input.trim().toLowerCase();
    if (!["yes", "no"].includes(normalized)) {
      addMessage("assistant", "Please answer with yes or no.", "Eligibility");
      return true;
    }
    state.citizen = normalized === "yes";
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

function handleIntent(intent) {
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
      addMessage(
        "assistant",
        "I can help with eligibility, voting steps, required documents, polling booths, or reminders. What would you like to know?",
        "Assistant"
      );
  }
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

  const intent = detectIntent(input);
  handleIntent(intent);
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

greet();
