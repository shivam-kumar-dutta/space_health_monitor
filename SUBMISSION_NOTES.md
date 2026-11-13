# AstroVitals submission notes

## Project

- **Project name:** AstroVitals
- **Challenge:** Create Health Monitoring Software for Astronauts on Space Missions
- **Hackathon:** NASA Space Apps Challenge 2026
- **Team:** [Enter the registered team name]
- **Team members:** [Enter all registered member names]
- **GitHub repository:** https://github.com/shivam-kumar-dutta/space_health_monitor
- **Expected hosted demo:** https://shivam-kumar-dutta.github.io/space_health_monitor/ (confirm the GitHub Pages workflow succeeds and the URL opens before putting it on the submission form).
- **Laptop demo:** Run locally at `http://localhost:3000` for the live table demo.
- **Demo video:** [Add link if the submission form requests one]

## Short description

AstroVitals is a local-first prototype for logging astronaut crew health readings, validating JSON data, reviewing trends, and surfacing simple alerts. It includes a small Node.js API and stores demo readings in a local JSON file. A separate dashboard panel displays real ISS radiation telemetry from NASA OSDR RadLab as environmental context.

## Data and attribution

“Data are courtesy of the NASA Open Science Data Repository (https://osdr.nasa.gov/bio/repo). ISS radiation telemetry accessed through NASA OSDR RadLab.”

The project includes 12 timestamped ISS DosTel absorbed-dose-rate samples from 2022-04-01 23:00 UTC to 2022-04-02 01:05 UTC. Units are µGy/hour. The data are preliminary environmental radiation measurements; they are not astronaut vital signs and are not used in the crew health score. Built-in sample crew health readings are synthetic demonstrations, not NASA data.

Sources:

- [NASA RadLab data API documentation](https://visualization.osdr.nasa.gov/radlab/gui/data-api/)
- [NASA OSDR FAQ and dataset citation guidance](https://science.nasa.gov/reference/osdr-faq/)
- [NASA RadLab release notes](https://visualization.osdr.nasa.gov/radlab/gui/knowledgebase/Release_history)
- [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/2026/)

## AI tool disclosure

The event instructions ask teams to mention AI tools used. Suggested truthful disclosure:

> OpenAI Codex was used as an AI coding assistant to help organize and refactor the frontend, implement the Node.js validation and dashboard features, integrate and document NASA OSDR RadLab data, and prepare project documentation. The team is reviewing the implementation and is responsible for understanding, validating, and presenting the final submission.

Keep this disclosure in the submission. Before presenting, have the team review the code and be ready to explain the parts it is claiming as its work. Do not claim the AI-generated portions were written solely by the team.

## Other source credits

- The interface loads **Inter**, **JetBrains Mono**, and **Space Grotesk** from [Google Fonts](https://fonts.google.com/). These are the only externally loaded interface assets identified in the project.
- No third-party Node.js packages are installed; the server uses built-in Node.js modules.
- NASA OSDR RadLab is credited above. The seeded crew vital readings are synthetic examples created for demonstration.

## Submission checklist from the event sheet

- Enter the registered team name and every registered team member. The sheet says team membership cannot change after registration.
- Submit the repository link using the organizer-provided form before its deadline. The linked GitHub repository is currently private; make sure organizers/judges have access before submitting (or ask the organizers whether private links are accepted).
- Confirm the README explains how to run the project; it currently includes `npm start` and the Windows launcher instructions.
- Bring the laptop/charger and have a working local demo plus a short presentation ready.
- Credit NASA data, Google Fonts, and OpenAI Codex in the submission.
- Explain the synthetic health examples, NASA radiation telemetry, and prototype limitations accurately.

## On-site event reminders from the attached sheet

- Carry a college/school ID; if unavailable, the sheet says to carry Aadhaar.
- Bring the laptop, chargers, extension board, and any hardware needed for the demo.
- Registration starts at 8:30 AM.
- On November 15, be at the table for pre-final screening from 8:00–10:00 AM.
- Final judging starts at 12:00 PM; stay at the table and be ready to present.
- The thank-you and prize-distribution session is listed for 6:00–6:30 PM.
- The sheet says teams must follow official team-size rules, cannot change members after registration, and should work on one official challenge only.

See [PRESENTATION_OUTLINE.md](PRESENTATION_OUTLINE.md) for a short demo talk track.

## Demo checklist

- Start with `npm start` or double-click `start-astrovitals.bat`.
- Open `http://localhost:3000` on the same computer.
- Click **Load example crew** to demonstrate trend and alert behavior. Explain that these crew entries are synthetic.
- Scroll to **NASA ISS radiation data** to show the sourced environmental telemetry and attribution.
- Add a crew member and save a sample reading to demonstrate validation and JSON persistence.
- Remove any personal data before sharing the project folder. Runtime state is local and excluded from the project ZIP.

## Limitations to disclose

This is a hackathon prototype, not medical software. Alert limits are demo settings and are not validated clinical criteria. The app does not diagnose or prescribe. The local demo has no sign-in, encryption, hosted database, or multi-user synchronization. NASA’s data in this prototype are environmental radiation readings, not personal astronaut vital data.
