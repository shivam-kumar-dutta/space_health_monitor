# AstroVitals

AstroVitals is a NASA Space Apps hackathon prototype for recording crew health readings and reviewing simple trends. It includes the browser dashboard and a small Node.js REST API with input validation and JSON-file storage.

## Run it

1. Install Node.js 18 or newer on your computer.
2. Open a terminal in this `astrovitals` folder.
3. Run `npm start`.
4. Open `http://localhost:3000` in your browser.

On Windows, you can also double-click `start-astrovitals.bat`; it opens the server window for you. Keep that window open while using the app. Open the URL in a regular browser on the same computer.

There are no third-party Node packages to install. The first run creates `data/state.json` when a reading is saved. That file is intentionally excluded from the shareable source project so personal/demo readings are not accidentally shared.

To share with teammates, send the project folder or ZIP. Each teammate can run their own local copy. The server listens on this computer's localhost address; it is not a hosted multi-user service.

## What is included

- `index.html`, `style.css`, `script.js`: dashboard, forms, and browser-side interaction.
- `server.js`: serves the page and provides REST API routes.
- `modules/dataValidator.js`: checks JSON shape, field types, allowed ranges, duplicate days, and blood-pressure relationships.
- `modules/healthEngine.js`: calculates reference-range status, personal baselines, simple trends, alerts, and report data.
- `data/nasa-iss-radiation.json`: timestamped NASA ISS DosTel environmental radiation measurements, displayed separately from crew health readings.
- `data/state.json`: created on this computer at runtime; not included in the shared source package.

## Validation rules

- A crew member needs a non-empty ID and name. IDs must be unique.
- Mission day must be a whole number, at least 1, and unique for that crew member.
- A reading may omit a measurement or use `null` when it is unavailable. If supplied, a measurement must be a finite number within its configured input bounds.
- Stress must be a whole number from 1 to 10.
- When both blood-pressure values are present, systolic must be higher than diastolic.
- Unsupported reading fields and malformed JSON are rejected with a list of field-specific errors.
- Saving a second reading for the same crew member and day replaces that day's reading, matching the dashboard behavior.

The numeric input bounds and alert thresholds are demo configuration in `modules/dataValidator.js` and `modules/healthEngine.js`. They are not validated medical criteria. Built-in example crew readings are synthetic and must not be presented as NASA or real astronaut health data. The NASA data included here are ISS environmental radiation measurements, not individual heart rate, blood pressure, oxygen, or other vital signs. This project is a decision-support demonstration, not a diagnostic or treatment tool.

## NASA data and attribution

The included snapshot contains 12 actual measurements from NASA OSDR RadLab for ISS DosTel instruments, sampled across 2022-04-01 23:00 UTC through 2022-04-02 01:05 UTC. It records absorbed dose rate in µGy/hour. The source query is included in the JSON. NASA describes the RadLab data as preliminary; these environmental measurements are context only, are not treated as daily dose, and are not added to the crew health score.

Submission credit: “Data are courtesy of the NASA Open Science Data Repository (https://osdr.nasa.gov/bio/repo). ISS radiation telemetry accessed through NASA OSDR RadLab.” NASA recommends this general OSDR acknowledgment; cite the specific dataset when one is used. Sources: [NASA RadLab data API](https://visualization.osdr.nasa.gov/radlab/gui/data-api/), [NASA OSDR FAQ and citation guidance](https://science.nasa.gov/reference/osdr-faq/), and [NASA RadLab release notes](https://visualization.osdr.nasa.gov/radlab/gui/knowledgebase/Release_history).

## API routes

All routes use JSON.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/state` | Read the complete saved crew state |
| `PUT` | `/api/state` | Validate and replace the complete crew state |
| `GET` | `/api/crew` | List crew members and record counts |
| `POST` | `/api/crew` | Add a crew member with `{ "name": "...", "role": "..." }` |
| `DELETE` | `/api/crew/:id` | Remove a crew member and their readings |
| `GET` | `/api/crew/:id/history` | Read that crew member's readings by mission day |
| `POST` | `/api/crew/:id/readings` | Validate and save or replace one day's reading |
| `GET` | `/api/crew/:id/health?day=14` | Evaluate a selected day; omit `day` for the latest reading |
| `GET` | `/api/crew/:id/report` | Return latest status, metric trends, and alert history |

Example reading body:

```json
{
  "day": 1,
  "hr": 62,
  "spo2": 97.6,
  "sys": 118,
  "dia": 76,
  "rr": 15,
  "temp": 36.6,
  "sleep": 7.1,
  "stress": 3,
  "ex": 125,
  "water": 2.6,
  "rad": 680
}
```

## Current boundaries

This is a hackathon prototype. It has no sign-in, encryption, remote database, or multi-user synchronization. The JSON file is stored on the computer running the server. Do not enter real or identifiable medical records. For a deployed team demo, the team would need to choose and configure a shared host and secure storage.
