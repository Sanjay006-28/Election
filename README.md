# Election Process Education Assistant

## Project Title
Election Process Education Assistant

## Chosen Vertical
Election Process Education

## Features
- Smart chat assistant that recognizes eligibility, voting steps, documents, and polling booth intents
- Decision-making logic based on age and citizenship with clear reasoning
- Context awareness to avoid repeated questions during the session
- Smart suggestions that guide next steps after each response
- Polling booth finder with Google Maps search link integration
- Reminder workflow with Google Calendar event link integration
- GSAP-powered animations for page load and chat interactions

## Approach and Logic
The assistant uses intent detection, structured responses, and session memory to keep the experience focused.

Eligibility logic:
- If age is 18 or older AND user is a citizen, the user is eligible to vote
- Otherwise, the user is not eligible

## How It Works
1. User types a question in the chat interface
2. The assistant detects intent and checks session context
3. The assistant asks for missing information only once
4. The assistant responds with structured steps or bullet points
5. The assistant suggests practical next actions

## Google Services Used (Real or Simulated)
- Google Maps (real service link): Opens a Google Maps search for polling booths based on location input
- Google Calendar (real service link): Generates a calendar event link for election reminders

## Assumptions
- Users provide accurate input
- Eligibility rules are simplified and may vary by location
- Google service links open in a new tab

## Setup Instructions
1. Open the project folder
2. Open index.html in a browser

## Testing
Eligibility test cases:
- Age 20, citizen yes -> Eligible
- Age 17, citizen yes -> Not eligible
- Age 30, citizen no -> Not eligible

Chat interaction testing:
- Ask eligibility, provide age and citizenship
- Ask for voting steps and document requirements
- Ask for polling booth and provide a location

UI responsiveness check:
- Desktop width above 960px
- Mobile width below 600px

## Live Demo
https://example.com/live-demo

## Project Structure
/project
  index.html
  styles.css
  script.js
  /assets
  README.md
