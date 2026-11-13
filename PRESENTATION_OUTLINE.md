# AstroVitals short presentation and demo

Use this as a 2–3 minute talk track. Replace the bracketed team details before presenting.

## 1. Introduce the project (20 seconds)

“Hello, we are **[team name]**. Our project is AstroVitals, a prototype for recording crew health readings, checking the data, and highlighting changes that may need attention during a space mission.”

## 2. Show the workflow (35 seconds)

“A crew member can be added and given a daily mission log. The app checks the JSON fields, data types, ranges, and blood-pressure relationship before saving. The dashboard then shows the record, trends, and simple alerts.”

**Demo:** Add a crew member, enter a sample reading, save it, then show the log and status. Use fictional values only.

## 3. Show NASA data use (30 seconds)

“We included a real sample of ISS radiation telemetry from NASA OSDR RadLab. The dashboard shows the instrument, timestamp, and absorbed dose rate in microgray per hour. This is environmental radiation telemetry, not an individual astronaut’s vital signs, so we keep it separate from the health score. Our seeded vital readings are synthetic examples.”

**Demo:** Scroll to the NASA ISS radiation data panel and point out the NASA source and source-query links.

## 4. Explain the implementation and limits (30 seconds)

“The project has a browser dashboard, a small Node.js API, and JSON-file persistence. It runs locally with `npm start`. The prototype has no sign-in or shared hosting. Its health thresholds are demonstration settings, not validated medical rules, so it is not a diagnostic tool.”

## 5. Close with credits (15 seconds)

“NASA OSDR RadLab supplied the radiation data, Google Fonts supplies the interface fonts, and OpenAI Codex assisted with coding and documentation. We have disclosed that AI assistance and are responsible for understanding and presenting the final project.”

## Before the event

- Fill in the registered team name and member names.
- Ensure the GitHub repository is accessible to the organizers and submit its link through their form before the deadline.
- Start the app and confirm the laptop can open `http://localhost:3000`.
- Practice the demo and keep the talk within the time the organizers assign.
