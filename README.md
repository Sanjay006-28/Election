# VoteIQ — Election Process Education Assistant

## Project Overview
VoteIQ is a premium civic education single-page app that helps voters understand eligibility, registration, required documents, booth lookup, and election reminders. It is built as a static frontend using semantic HTML, CSS, vanilla JavaScript, GSAP, and real Google Calendar URL integration.

## Chosen Vertical
Civic Tech / GovTech / Public Education

## Features
- Three-panel desktop SPA: guide, assistant chat, and booth finder.
- Mobile bottom navigation for switching between guide, chat, and booth panels.
- Eligibility checker with age validation, citizenship toggle, and animated result badge.
- Six-state assistant flow: `IDLE`, `ASK_AGE`, `ASK_CITIZENSHIP`, `EVALUATE`, `POST_ELIGIBLE`, `POST_BOOTH`.
- Intent detection for eligibility, voting steps, documents, polling booths, calendar reminders, FAQs, and greetings.
- Accessible chat log with bot and user bubbles, timestamps, avatar, typing indicator, and suggestion chips.
- Voting process accordion with five concrete steps.
- FAQ accordion with smooth height transitions and rotating chevrons.
- Documents required card with concise icon list.
- Simulated map panel with three booth cards and Google Maps directions links.
- Real Google Calendar template button without an API key.
- GSAP entrance, hover, press, typing, chip, panel, and booth animations.
- URL-gated test suite shown with `?test=true`.
- CSP meta tag, input validation, and user input sanitization.

## System Architecture
```text
index.html
  |
  |-- style.css
  |     |-- theme variables
  |     |-- responsive layout
  |     |-- glass cards, chat UI, map simulation
  |     |-- animated background mesh
  |
  |-- GSAP CDN + ScrollTrigger CDN
  |
  |-- script.js
        |-- security utilities
        |-- eligibility engine
        |-- intent detection
        |-- assistant state machine
        |-- DOM rendering
        |-- GSAP animation orchestration
        |-- Google Calendar and Maps URL builders
        |-- test runner
```

## Decision Logic Flowchart
```text
User message
    |
    v
validateInput()
    |
    +-- invalid --> Bot asks for a valid question
    |
    v
sanitizeInput() for display
    |
    v
Current state?
    |
    +-- ASK_AGE ---------> extractAge() ----------+
    |                                             |
    +-- ASK_CITIZENSHIP -> parseCitizenship() ----+--> checkEligibility()
    |                                             |
    +-- IDLE/POST_* -----> detectIntent() --------+
                              |
                              +-- ELIGIBILITY --> collect missing age/citizenship
                              +-- HOW_TO_VOTE --> registration steps
                              +-- DOCUMENTS --> required documents
                              +-- POLLING_BOOTH --> mock booth results
                              +-- CALENDAR --> Google Calendar guidance
                              +-- FAQ/GREETING/UNKNOWN --> civic education response
```

## Google Services Used
- Google Calendar: `buildCalendarURL()` creates a real template URL and the Calendar button opens it in a new tab.
- Google Maps: booth cards open Google Maps directions URLs using mock booth coordinates.
- Google Fonts: DM Serif Display and DM Sans are loaded from Google Fonts.

## File Structure
```text
index.html
style.css
script.js
README.md
```

## How to Run
Open `index.html` directly in a browser. The app is fully static and does not require a build step or local server.

To open with tests enabled:
```text
index.html?test=true
```

## How to Enable Real Google Maps API
The app includes:
```js
const MAP_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
```

To use a real Maps embed or Places lookup:
1. Create or select a Google Cloud project.
2. Enable the Maps JavaScript API and Places API.
3. Restrict the key by HTTP referrer.
4. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `script.js`.
5. Replace the simulated `.map-grid` with a Google Maps container and initialize the map using the booth coordinates.

The current implementation intentionally avoids requiring a key by using Google Maps directions URLs.

## Test Suite
Add `?test=true` to the URL to render the floating test panel. It runs 14 checks covering:
- Eligibility outcomes.
- Age validation.
- Input validation.
- Sanitization.
- Intent detection.

## Accessibility Notes
- Chat log uses `role="log"` and `aria-live="polite"`.
- The chat input has `aria-label="Type your question"`.
- All buttons include descriptive labels or visible text.
- Skip link jumps directly to the chat input.
- Semantic landmarks include `header`, `main`, `nav`, `aside`, and `section`.
- Keyboard focus uses a visible gold outline with offset.
- Accordions expose `aria-expanded` and `aria-controls`.
- Color choices are designed for high contrast on the dark theme.

## Security Measures
- CSP meta tag restricts scripts, styles, fonts, images, frames, base URI, and forms.
- User chat input is validated before processing.
- User-originated content is passed through `sanitizeInput()` before display.
- DOM insertion uses `textContent` and element creation rather than unsafe HTML injection.
- Chat input length is capped at 499 characters.
- Age input is limited to a valid range.
- External navigation is limited to Google Calendar and Google Maps URL builders.

## Assumptions
- Eligibility rules are generalized for education and should be confirmed with the official local election office.
- Mock booth data demonstrates the integration pattern and UI behavior.
- The Google Calendar date uses the requested fixed template value.
- This is a frontend prototype and does not store personal data.

## Live Demo Placeholder
Deploy the four static files to any static host such as GitHub Pages, Netlify, Vercel, Firebase Hosting, or an internal civic portal.

## Author
VoteIQ frontend implementation generated for civic-tech education workflows.
