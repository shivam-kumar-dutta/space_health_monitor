# AstroVitals — complete AI handoff

> **Purpose:** Give another AI the complete project context and source code in one file. The user should not need to repeat the project background or attach separate source files.

## Instructions for the AI receiving this handoff

You are continuing work with a beginner student on the AstroVitals NASA Space Apps hackathon project. Treat this document as the full project handoff. First understand the project and existing code below. Do not ask the user to repeat context already included here. If they say to continue, inspect the current implementation, make useful progress autonomously, and provide exact run instructions. The user's immediate priority is having a complete, shareable project; detailed teaching can follow later. When teaching, use plain language and explain the actual code in small steps.

The complete current project source appears at the end of this document. It can be copied into files using the paths shown in each section. No external source files are required to understand what was built.

## Project background

- **Project:** AstroVitals, an astronaut crew health monitoring prototype.
- **Hackathon:** NASA Space Apps Challenge 2026.
- **Challenge:** “Create Health Monitoring Software for Astronauts on Space Missions.”
- **Event details previously discussed:** November 14–15, 2026, Haldia Institute of Technology; five-member student team.
- **User's role:** Backend/core telemetry and health logic. The team is made up of beginners, so explanations should be beginner-friendly.
- **Earlier learning stage:** JavaScript JSON validation. The user practiced checking missing (`undefined`) and unavailable (`null`) fields, data types, finite numeric values, and ranges. Their earlier exercise used `astronautId`, `heartRate`, `spo2`, `temperature`, and `sleepHours`.
- **Current priority:** The user asked to complete the project first so they can share it with the team, and learn the implementation afterward.

## NASA data and submission update (Nov 13, 2026)

The project now includes `data/nasa-iss-radiation.json` with 12 real ISS DosTel absorbed-dose-rate records retrieved from the NASA OSDR RadLab API, and a separate dashboard panel displays them in µGy/hour. These records are environmental telemetry, not crew vital signs, and do not affect the health score. The built-in crew health readings remain synthetic demo data. See `README.md` for the dataset caveat and NASA attribution; see `SUBMISSION_NOTES.md` for the prepared submission summary and fields the team must fill in. Current project files are canonical if their contents differ from the older source snapshot below.

## Current implementation

This is a small, dependency-free Node.js app. It contains:

- A responsive HTML/CSS/JavaScript dashboard for crew, daily readings, status, findings, and CSV export.
- Browser-side validation and local browser storage fallback.
- A Node.js HTTP server that serves the frontend and REST API.
- Backend validation of crew state and daily readings, including finite-number and range checks, stress integer validation, unique mission days, and systolic/diastolic consistency.
- Health evaluation, personal baselines, trend alerts, radiation rollup, and structured JSON reports.
- Local JSON-file persistence in `data/state.json` when run on a user's computer.
- `README.md` for team setup and `STUDY_GUIDE.md` for the learner.

### Important behavior and limits

- Use Node.js 18 or newer. There are no third-party dependencies; do not run `npm install` unless dependencies are later added.
- On Windows, extract the package and double-click `start-astrovitals.bat`; keep its window open. Then open `http://localhost:3000` in a regular browser on the same computer. A browser embedded inside another application may not share the computer's localhost network.
- Alternatively, open a terminal in the project folder and run `npm start`.
- Each teammate's local copy stores its own data. There is no hosted database, login, encryption, or multi-user synchronization.
- Thresholds and scores are demo values, not validated medical criteria. AstroVitals is not a diagnostic or treatment tool. Do not enter real or identifiable medical records.
- The dashboard uses keys such as `hr`, `sys`, `dia`, `sleep`, and `water`; backend validation and API examples match this frontend schema. The earlier learning exercise's astronaut object is historical context, not the current API's exact payload shape.

## Project file map

- `index.html` — page structure.
- `style.css` — visual styling and responsive layout.
- `script.js` — frontend interactions, browser validation, rendering, CSV, local cache, and API synchronization.
- `server.js` — static-file server and API routes.
- `modules/dataValidator.js` — reusable validation functions.
- `modules/healthEngine.js` — scoring, baseline comparison, alerts, and reports.
- `package.json` — project metadata and `npm start` command.
- `start-astrovitals.bat` — Windows launch helper.
- `README.md` — team run guide and API reference.
- `STUDY_GUIDE.md` — learner-focused code map.
- `data/state.json` — generated at runtime; it is intentionally excluded from the share package.

## API overview

All endpoints use JSON.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/state` | Read complete saved state |
| PUT | `/api/state` | Validate and replace complete state |
| GET | `/api/crew` | List crew members and record counts |
| POST | `/api/crew` | Add a crew member using `{ "name": "...", "role": "..." }` |
| DELETE | `/api/crew/:id` | Remove a crew member and their records |
| GET | `/api/crew/:id/history` | Read records ordered by mission day |
| POST | `/api/crew/:id/readings` | Validate and save/replace one mission-day record |
| GET | `/api/crew/:id/health?day=14` | Evaluate a selected day; omit `day` for latest |
| GET | `/api/crew/:id/report` | Return latest status, metric trends, and alert history |

Example reading:

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

## Ready-to-use continuation prompt

The user can send this file to another AI and say only: “Read this handoff and continue.” The receiving AI should treat the source below as the project baseline, preserve the current working flow, and ask questions only when a genuinely required choice cannot be inferred. The user asked to receive working code first and explanations afterward.

---

# Complete project source


## `README.md`

````markdown
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
- `data/state.json`: created on this computer at runtime; not included in the shared source package.

## Validation rules

- A crew member needs a non-empty ID and name. IDs must be unique.
- Mission day must be a whole number, at least 1, and unique for that crew member.
- A reading may omit a measurement or use `null` when it is unavailable. If supplied, a measurement must be a finite number within its configured input bounds.
- Stress must be a whole number from 1 to 10.
- When both blood-pressure values are present, systolic must be higher than diastolic.
- Unsupported reading fields and malformed JSON are rejected with a list of field-specific errors.
- Saving a second reading for the same crew member and day replaces that day's reading, matching the dashboard behavior.

The numeric input bounds and alert thresholds are demo configuration in `modules/dataValidator.js` and `modules/healthEngine.js`. They are not validated medical criteria. This project is a decision-support demonstration, not a diagnostic or treatment tool.

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
````


## `STUDY_GUIDE.md`

````markdown
# AstroVitals: read this later to understand the project

The project is already assembled so the team can run the demo. This guide maps the code to the backend topics you were learning.

## The request path

1. A teammate records crew readings in the browser form.
2. `script.js` keeps a local browser copy and sends the complete state to `PUT /api/state` when the page is opened through the Node server.
3. `server.js` parses the request, asks `dataValidator.js` to validate it, then saves valid data into `data/state.json`.
4. The health engine can evaluate a reading or build a report from the saved history.
5. The page reloads shared state from `GET /api/state`.

The dashboard also works when `index.html` is opened directly. In that case it uses browser local storage and does not use the API.

## Files to learn in order

1. **`modules/dataValidator.js`** — Start here. `validateEntry` checks one day's measurements. `validateState` checks the crew and all their readings. Each error includes a path so the API can tell a user exactly which field needs attention.
2. **`server.js`** — Find the `api` function. It matches HTTP method and URL, reads JSON, calls validation, and returns a status code plus JSON. `writeState` serializes writes to avoid two fast saves overwriting one another.
3. **`modules/healthEngine.js`** — `evaluateEntry` calculates a day's score and alerts. `baseline` compares a value with up to seven earlier readings after at least four are available. `buildReport` summarizes history and changes over time.
4. **`script.js`** — Read `load` and `save` to see how the page connects to the API while keeping a local copy.

## Data checks in plain language

- `undefined` means a field was left out. `null` means the field exists but no reading is available. Both are permitted for individual measurements because the dashboard allows partial logs.
- `Number.isFinite(value)` rejects strings, `NaN`, and infinities. JSON itself cannot represent `NaN` or infinity, but the check makes the rule explicit for any future caller.
- Min/max checks reject impossible software inputs before they reach the scoring logic.
- Cross-field checks catch combinations that do not make sense, such as systolic pressure being less than or equal to diastolic pressure.
- Duplicate-day checks keep one record per crew member per mission day. A new record for that day replaces the old one, which is how the current form behaves.

## API examples

After starting the app, the dashboard is at `http://localhost:3000`. The JSON routes are documented in `README.md`. For example, `GET /api/crew` lists crew, and `GET /api/crew/<id>/report` returns a structured report.

When you resume learning, a useful exercise is to add one validation rule, submit a deliberately invalid JSON body, and inspect the error path returned by the API.

## Important scope note

Scores and thresholds are demonstration logic chosen for the prototype. They are not clinical standards or medical advice. The server is local-only and has no authentication or remote database.
````


## `package.json`

````json
{
  "name": "astrovitals",
  "version": "1.0.0",
  "private": true,
  "description": "Hackathon prototype for astronaut health telemetry, validation, monitoring, and reports.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18"
  }
}
````


## `start-astrovitals.bat`

````bat
@echo off
cd /d "%~dp0"
echo Starting AstroVitals at http://localhost:3000
node server.js
echo.
echo AstroVitals has stopped. Press any key to close this window.
pause >nul
````


## `index.html`

````html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>AstroVitals</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap">


<div class="app">
  <header class="top">
    <div class="brand">
      <span class="mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21"/></svg>
      </span>
      <div>
        <h1>AstroVitals</h1>
        <p>Onboard crew health monitor. Enter readings, get status, alerts and trends.</p>
      </div>
    </div>
    <div class="mission" id="missionStats"></div>
  </header>

  <div class="shell">
    <aside class="rail">
      <section>
        <div class="label">Crew</div>
        <div class="crewlist" id="crewList"></div>
      </section>
      <section class="panel">
        <div class="label">Add crew member</div>
        <form class="addform" id="addCrew" autocomplete="off">
          <input type="text" id="newName" placeholder="Name" maxlength="40" aria-label="Crew member name">
          <input type="text" id="newRole" placeholder="Role (optional)" maxlength="40" aria-label="Crew member role">
          <button class="btn primary" type="submit">Add to crew</button>
        </form>
      </section>
      <section class="panel tools">
        <div class="label">Data</div>
        <button class="btn" data-action="load-example" id="exampleBtn" type="button">Load example crew</button>
        <button class="btn" data-action="copy-csv" type="button">Copy all readings as CSV</button>
        <textarea class="csv" id="csvBox" hidden readonly aria-label="CSV export"></textarea>
        <button class="btn danger" data-action="clear-all" id="clearBtn" type="button">Clear all data</button>
        <p style="font-size:.74rem;color:var(--muted)">Data is saved on this computer. Nothing is sent to a remote service.</p>
      </section>
    </aside>

    <main>
      <section class="card" id="sumWrap"></section>
      <div class="work" id="work">
        <div class="colA">
          <section class="card" id="findWrap"></section>
          <section class="card" id="metricWrap"></section>
        </div>
        <div class="colB"><section class="card form" id="formWrap"></section></div>
      </div>
      <section class="card" id="logWrap"></section>
    </main>
  </div>

  <p class="disclaimer">AstroVitals is a hackathon prototype for decision support. Limits and thresholds are demo values, not validated medical criteria, and nothing here diagnoses or treats a condition. Follow mission medical protocols and contact the flight surgeon for any real concern.</p>
</div>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
  <script src="script.js"></script>
</body>
</html>
````


## `style.css`

````css
/* Layout: crew rail on the left, console on the right. Summary first, then findings and metrics beside a sticky log form, then the full log.
   Cool slate neutrals, cobalt accent. Green/amber/red are reserved for status only. */
:root{
  --bg:#EDF0F5; --surface:#FFFFFF; --surface-2:#F5F7FA; --ink:#13202F; --muted:#586677; --line:#D6DCE5;
  --accent:#2C58E6; --accent-ink:#FFFFFF; --accent-soft:#E3EAFD;
  --ok:#1B7F55; --ok-bg:#E1F3EA; --warn:#9A5B00; --warn-bg:#FBEDD3; --crit:#C22B37; --crit-bg:#FBE3E5;
  --font-display:'Space Grotesk',system-ui,sans-serif;
  --font-body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-data:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0D1319; --surface:#151D27; --surface-2:#1B2531; --ink:#E7EDF4; --muted:#93A2B4; --line:#26323F;
    --accent:#86A4FF; --accent-ink:#0D1319; --accent-soft:#1C2B52;
    --ok:#4CC38A; --ok-bg:#12291F; --warn:#E5A53E; --warn-bg:#33270F; --crit:#FF6F78; --crit-bg:#3A1A1F;
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0D1319; --surface:#151D27; --surface-2:#1B2531; --ink:#E7EDF4; --muted:#93A2B4; --line:#26323F;
  --accent:#86A4FF; --accent-ink:#0D1319; --accent-soft:#1C2B52;
  --ok:#4CC38A; --ok-bg:#12291F; --warn:#E5A53E; --warn-bg:#33270F; --crit:#FF6F78; --crit-bg:#3A1A1F;
  color-scheme:dark;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:14.5px;line-height:1.5}
.app{max-width:1380px;margin:0 auto;padding-block:20px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1,h2,h3{font-family:var(--font-display);margin:0;text-wrap:balance;letter-spacing:-0.01em}
p{margin:0}
button{font:inherit;color:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.num,.mono{font-family:var(--font-data);font-variant-numeric:tabular-nums}

.top{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;margin-bottom:18px}
.brand{display:flex;gap:12px;align-items:center;min-width:0}
.mark{width:40px;height:40px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center;flex:none}
.brand h1{font-size:1.45rem;line-height:1.1}
.brand p{color:var(--muted);font-size:.85rem}
.mission{font-family:var(--font-data);font-size:.8rem;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap}
.mission b{color:var(--ink);font-weight:500}

.shell{display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px;align-items:start}
.rail{display:flex;flex-direction:column;gap:16px;position:sticky;top:env(safe-area-inset-top,0px);min-width:0}
.label{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
.crewlist{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.crewbtn{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--line);background:var(--surface);border-radius:8px;min-width:0}
.crewbtn[aria-current="true"]{border-color:var(--accent);background:var(--accent-soft)}
.crewbtn .nm{display:block;font-weight:600;overflow-wrap:anywhere}
.crewbtn .rl{display:block;color:var(--muted);font-size:.8rem;overflow-wrap:anywhere}
.crewbtn .txt{min-width:0;flex:1}
.dot{width:10px;height:10px;border-radius:50%;flex:none;background:var(--line)}
.dot.s0{background:var(--ok)} .dot.s1{background:var(--warn)} .dot.s2{background:var(--crit)}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px}
.addform{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.tools{display:flex;flex-direction:column;gap:8px}

input[type=text],input[type=number]{font:inherit;color:var(--ink);background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:8px 10px;width:100%;min-width:0}
input::placeholder{color:var(--muted);opacity:.75}
.btn{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:8px 12px;font-weight:500;text-align:center}
.btn:hover{border-color:var(--accent)}
.btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:600}
.btn.danger.armed{background:var(--crit);border-color:var(--crit);color:#fff}
.btn.sm{padding:5px 9px;font-size:.8rem}
textarea.csv{width:100%;height:90px;font-family:var(--font-data);font-size:.7rem;background:var(--surface-2);color:var(--ink);border:1px solid var(--line);border-radius:7px;padding:6px}

main{display:flex;flex-direction:column;gap:20px;min-width:0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px;min-width:0}
.summary{display:flex;flex-wrap:wrap;gap:20px 28px;align-items:center;justify-content:space-between}
.sumleft{display:flex;gap:20px;align-items:center;min-width:0;flex-wrap:wrap}
.ring{position:relative;width:96px;height:96px;flex:none}
.ring svg{display:block;width:96px;height:96px}
.ring .track{fill:none;stroke:var(--line);stroke-width:9}
.ring .arc{fill:none;stroke-width:9;stroke-linecap:round;transition:stroke-dasharray .4s}
.ring.s0 .arc{stroke:var(--ok)} .ring.s1 .arc{stroke:var(--warn)} .ring.s2 .arc{stroke:var(--crit)} .ring.sn .arc{stroke:var(--line)}
.ring .big{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--font-data);font-size:1.6rem;font-weight:500}
.ring .big small{display:block;font-size:.62rem;color:var(--muted);text-align:center;letter-spacing:.06em;text-transform:uppercase;font-family:var(--font-body)}
.sumtext{min-width:0}
.sumtext h2{font-size:1.6rem;line-height:1.15;overflow-wrap:anywhere}
.sumtext .sub{color:var(--muted);margin-top:2px}
.sumactions{display:flex;gap:8px;flex-wrap:wrap}
.pill,.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:2px 10px;font-size:.75rem;font-weight:600;letter-spacing:.02em;white-space:nowrap}
.s0.pill,.chip.s0{background:var(--ok-bg);color:var(--ok)}
.s1.pill,.chip.s1{background:var(--warn-bg);color:var(--warn)}
.s2.pill,.chip.s2{background:var(--crit-bg);color:var(--crit)}
.sn.pill,.chip.sn{background:var(--surface-2);color:var(--muted)}
.badge{font-size:.68rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line);color:var(--muted);border-radius:4px;padding:1px 6px;margin-left:6px;vertical-align:middle}

.work{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start}
.colA{display:flex;flex-direction:column;gap:20px;min-width:0}
.colB{position:sticky;top:env(safe-area-inset-top,0px);min-width:0}
.sechead{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.sechead h3{font-size:1.05rem}
.sechead span{color:var(--muted);font-size:.8rem}

.findings{display:flex;flex-direction:column;gap:10px}
.finding{border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;border:1px solid transparent}
.finding.s2{background:var(--crit-bg);border-color:color-mix(in srgb,var(--crit) 35%,transparent)}
.finding.s1{background:var(--warn-bg);border-color:color-mix(in srgb,var(--warn) 35%,transparent)}
.finding .ft{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.finding .ft strong{font-family:var(--font-display);font-size:.98rem}
.finding ul{margin:0;padding-left:18px}
.finding .act{font-size:.86rem;color:var(--ink)}
.finding .act b{font-weight:600}
.allclear{background:var(--ok-bg);color:var(--ok);border-radius:8px;padding:12px 14px;font-weight:500}
.empty{color:var(--muted);padding:6px 0}

.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px}
.mcard{border:1px solid var(--line);border-radius:9px;padding:12px;background:var(--surface-2);display:flex;flex-direction:column;gap:4px;min-width:0}
.mcard[data-sev="2"]{border-color:var(--crit)} .mcard[data-sev="1"]{border-color:var(--warn)}
.mcard .mh{display:flex;justify-content:space-between;gap:8px;align-items:center}
.mcard .mn{font-size:.8rem;color:var(--muted);font-weight:500}
.mcard .mv{display:flex;align-items:baseline;gap:6px}
.mcard .mv .num{font-size:1.9rem;font-weight:500;line-height:1.1}
.mcard .mv .unit{color:var(--muted);font-size:.8rem}
.mcard .mm{font-size:.76rem;color:var(--muted);font-family:var(--font-data);min-height:1.2em}
.spark{display:block;width:100%;height:auto;margin-top:4px}
.spark .grid{stroke:var(--line);stroke-width:1;fill:none}
.spark .band{fill:var(--accent);opacity:.13}
.spark .line{fill:none;stroke:var(--accent);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
.spark .pt{fill:var(--muted)}
.spark .end.s0{fill:var(--ok)} .spark .end.s1{fill:var(--warn)} .spark .end.s2{fill:var(--crit)}
.spark text{fill:var(--muted);font-family:var(--font-data);font-size:7.5px}
.dose{margin-top:6px}
.dose .bar{height:7px;border-radius:4px;background:var(--line);overflow:hidden}
.dose .bar i{display:block;height:100%;background:var(--accent);border-radius:4px}
.dose .bar i.s1{background:var(--warn)} .dose .bar i.s2{background:var(--crit)}
.dose p{font-size:.72rem;color:var(--muted);margin-top:4px;font-family:var(--font-data)}

.form h3{font-size:1.05rem}
.form .hint{color:var(--muted);font-size:.8rem;margin:2px 0 12px}
.grp{margin-top:14px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.fld{min-width:0}
.fld label{display:block;font-size:.78rem;font-weight:500;margin-bottom:3px}
.inp{position:relative}
.inp input{padding-right:46px}
.inp .u{position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:.7rem;color:var(--muted);font-family:var(--font-data);pointer-events:none}
.fld .live{font-size:.7rem;min-height:1.1em;margin-top:2px;color:var(--muted)}
.fld[data-sev="0"] input{border-color:var(--ok)} .fld[data-sev="0"] .live{color:var(--ok)}
.fld[data-sev="1"] input{border-color:var(--warn)} .fld[data-sev="1"] .live{color:var(--warn)}
.fld[data-sev="2"] input{border-color:var(--crit)} .fld[data-sev="2"] .live{color:var(--crit)}
.fld.wide{grid-column:1/-1}
.formerr{color:var(--crit);font-size:.82rem;margin-top:10px;min-height:1em}
.formact{display:flex;gap:8px;margin-top:12px}
.formact .btn.primary{flex:1}

.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:.82rem}
th,td{padding:7px 10px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--line)}
th{font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface-2);font-weight:600;position:sticky;top:0}
th:first-child,td:first-child{text-align:left}
td{font-family:var(--font-data);font-variant-numeric:tabular-nums}
td.c1{color:var(--warn);font-weight:500} td.c2{color:var(--crit);font-weight:600}
tr:last-child td{border-bottom:0}
td.act{text-align:right;font-family:var(--font-body)}
td.act button{border:0;background:none;color:var(--accent);font-size:.78rem;padding:2px 6px}

.disclaimer{margin-top:24px;color:var(--muted);font-size:.78rem;max-width:80ch}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:9px 16px;border-radius:8px;font-size:.85rem;z-index:20;max-width:calc(100vw - 32px)}
.bigempty{text-align:center;padding:40px 16px}
.bigempty h2{font-size:1.4rem;margin-bottom:6px}
.bigempty p{color:var(--muted);max-width:46ch;margin:0 auto 14px}

@media (max-width:1180px){
  .work{grid-template-columns:minmax(0,1fr)}
  .colB{position:static;order:-1}
}
@media (max-width:860px){
  .shell{grid-template-columns:minmax(0,1fr)}
  .rail{position:static}
}
@media (prefers-reduced-motion:reduce){.ring .arc{transition:none}}
````


## `script.js`

````javascript
/* ---------- Engine: pure functions, no DOM ---------- */
const SPECS = {
  hr:    {label:'Resting heart rate', short:'Heart rate', unit:'bpm', dec:0, min:20, max:250, alertLo:40, watchLo:50, watchHi:90, alertHi:100, base:{sd:2, dir:'both'}, typical:'50 to 90'},
  spo2:  {label:'Blood oxygen (SpO₂)', short:'SpO₂', unit:'%', dec:1, min:50, max:100, alertLo:92, watchLo:95, base:{sd:0.5, dir:'low'}, typical:'95 to 100'},
  sys:   {label:'Systolic pressure', short:'Systolic', unit:'mmHg', dec:0, min:50, max:260, alertLo:85, watchLo:90, watchHi:129, alertHi:139, base:{sd:3, dir:'both'}, typical:'90 to 129'},
  dia:   {label:'Diastolic pressure', short:'Diastolic', unit:'mmHg', dec:0, min:30, max:160, alertLo:55, watchLo:60, watchHi:84, alertHi:89, base:{sd:2, dir:'both'}, typical:'60 to 84'},
  rr:    {label:'Respiratory rate', short:'Resp. rate', unit:'/min', dec:0, min:4, max:60, alertLo:10, watchLo:12, watchHi:20, alertHi:24, base:{sd:1, dir:'both'}, typical:'12 to 20'},
  temp:  {label:'Body temperature', short:'Temp', unit:'°C', dec:1, min:30, max:43, alertLo:35.5, watchLo:36.1, watchHi:37.2, alertHi:37.9, base:{sd:0.15, dir:'both'}, typical:'36.1 to 37.2'},
  sleep: {label:'Sleep last period', short:'Sleep', unit:'h', dec:1, min:0, max:24, alertLo:5.5, watchLo:6.5, base:{sd:0.4, dir:'low'}, typical:'6.5 or more'},
  stress:{label:'Stress (1 to 10)', short:'Stress', unit:'/10', dec:0, min:1, max:10, watchHi:5, alertHi:7, typical:'1 to 5'},
  ex:    {label:'Exercise', short:'Exercise', unit:'min', dec:0, min:0, max:600, alertLo:30, watchLo:90, typical:'90 or more'},
  water: {label:'Fluid intake', short:'Fluids', unit:'L', dec:1, min:0, max:10, alertLo:1.5, watchLo:2.0, typical:'2.0 or more'},
  rad:   {label:'Radiation dose', short:'Radiation', unit:'µSv/day', dec:0, min:0, max:100000, watchHi:1000, alertHi:2000, typical:'under 1000'}
};
const ORDER = ['hr','spo2','sys','dia','rr','temp','sleep','stress','ex','water','rad'];
const RAD_LIMIT_30D = 250000; // µSv, demo 30-day limit (250 mSv)
const SEV_NAME = ['Nominal','Watch','Alert'];

function judge(s, v){
  if (v == null || isNaN(v)) return {sev:-1};
  if (s.alertLo != null && v < s.alertLo) return {sev:2, dir:'low', limit:s.alertLo};
  if (s.alertHi != null && v > s.alertHi) return {sev:2, dir:'high', limit:s.alertHi};
  if (s.watchLo != null && v < s.watchLo) return {sev:1, dir:'low', limit:s.watchLo};
  if (s.watchHi != null && v > s.watchHi) return {sev:1, dir:'high', limit:s.watchHi};
  return {sev:0};
}
function fmt(k, v){
  if (v == null || isNaN(v)) return '—';
  return Number(v).toFixed(SPECS[k].dec);
}
function byDay(entries){ return entries.slice().sort((a,b)=>a.day-b.day); }

function baselineFor(entries, day, k){
  const s = SPECS[k];
  if (!s.base) return null;
  const prior = byDay(entries).filter(e => e.day < day && e[k] != null).slice(-7);
  if (prior.length < 4) return null;
  const vals = prior.map(e => e[k]);
  const mean = vals.reduce((a,b)=>a+b,0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)*(b-mean),0) / (vals.length - 1));
  return {mean, sd: Math.max(sd, s.base.sd), n: vals.length};
}
function radCum(entries, day){
  return entries.filter(e => e.day > day - 30 && e.day <= day && e.rad != null).reduce((a,e)=>a+e.rad,0);
}

function evalEntry(entries, entry){
  const metrics = {};
  let score = 100;
  ORDER.forEach(k => {
    const s = SPECS[k], v = entry[k];
    const m = {k, v, sev:-1, msgs:[], base:null, z:null};
    if (v != null) {
      const j = judge(s, v);
      m.sev = j.sev;
      if (j.sev > 0) {
        const where = j.dir === 'low' ? 'below' : 'above';
        const kind = j.sev === 2 ? 'alert limit' : 'normal range';
        m.msgs.push(s.short + ' ' + fmt(k, v) + ' ' + s.unit + ' is ' + where + ' the ' + fmt(k, j.limit) + ' ' + s.unit + ' ' + kind + '.');
      }
      const b = baselineFor(entries, entry.day, k);
      if (b) {
        m.base = b;
        m.z = (v - b.mean) / b.sd;
        const bad = s.base.dir === 'low' ? -m.z : Math.abs(m.z);
        const bs = bad >= 3 ? 2 : bad >= 2 ? 1 : 0;
        if (bs > 0) {
          m.msgs.push(s.short + ' is ' + Math.abs(m.z).toFixed(1) + ' SD ' + (m.z > 0 ? 'above' : 'below') + ' this person’s own baseline of ' + fmt(k, b.mean) + ' ' + s.unit + '.');
        }
        if (bs > m.sev) m.sev = bs;
      }
      if (m.sev === 1) score -= 4;
      if (m.sev === 2) score -= 10;
    }
    metrics[k] = m;
  });

  const sv = k => metrics[k].sev;
  const patterns = [];
  const hrUp = metrics.hr.z != null && metrics.hr.z >= 1.5;
  if (sv('sleep') >= 1 && sv('stress') >= 1 && (sv('hr') >= 1 || hrUp)) {
    patterns.push({id:'fatigue', sev:(sv('sleep') === 2 || sv('stress') === 2) ? 2 : 1, title:'Fatigue and strain pattern',
      text:'Short sleep, high stress and a raised heart rate are showing together.',
      action:'Protect a full sleep period, lighten non-critical tasks, and tell the flight surgeon if this continues another two days.'});
  }
  if (sv('temp') >= 1 && (sv('hr') >= 1 || sv('rr') >= 1)) {
    patterns.push({id:'illness', sev:(sv('temp') === 2 && (sv('hr') === 2 || sv('rr') === 2)) ? 2 : 1, title:'Possible infection pattern',
      text:'Temperature is out of range along with a raised heart or breathing rate.',
      action:'Retake temperature after 10 minutes of rest, isolate from crewmates if it holds, and contact the flight surgeon.'});
  }
  if (sv('spo2') >= 1 && sv('rr') >= 1) {
    patterns.push({id:'resp', sev:(sv('spo2') === 2) ? 2 : 1, title:'Breathing and oxygen pattern',
      text:'Low blood oxygen is paired with an abnormal breathing rate.',
      action:'Check the sensor fit, retake the reading, and check cabin CO₂ and ventilation. Escalate right away if the reading is confirmed.'});
  }
  if (sv('water') >= 1 && (sv('hr') >= 1 || hrUp)) {
    patterns.push({id:'hydration', sev:1, title:'Hydration pattern',
      text:'Low fluid intake is paired with a raised heart rate.',
      action:'Increase fluids over the next several hours and recheck heart rate.'});
  }
  const cum = radCum(entries, entry.day);
  const pct = cum / RAD_LIMIT_30D;
  if (sv('rad') === 2 || pct >= 0.8) {
    patterns.push({id:'rad', sev:(pct >= 1 || sv('rad') === 2) ? 2 : 1, title:'Radiation exposure',
      text: pct >= 0.8
        ? 'The 30-day dose is at ' + Math.round(pct * 100) + '% of the demo limit.'
        : 'Today’s dose of ' + fmt('rad', entry.rad) + ' µSv is far above the usual daily level.',
      action:'Move to the best-shielded area and follow the radiation event checklist. Report the dosimeter reading to mission control.'});
  }
  const recent = byDay(entries).filter(e => e.day <= entry.day && e.sleep != null).slice(-3);
  if (recent.length === 3 && recent.reduce((a,e)=>a+e.sleep,0) / 3 < 6.5) {
    patterns.push({id:'sleepdebt', sev:1, title:'Sleep debt building',
      text:'Sleep over the last three logs averages ' + (recent.reduce((a,e)=>a+e.sleep,0) / 3).toFixed(1) + ' h.',
      action:'Plan a protected sleep block and review the work schedule with the commander.'});
  }
  const hrs = byDay(entries).filter(e => e.day <= entry.day && e.hr != null).slice(-3);
  if (hrs.length === 3 && hrs[0].hr < hrs[1].hr && hrs[1].hr < hrs[2].hr && hrs[2].hr - hrs[0].hr >= 8) {
    patterns.push({id:'hrtrend', sev:1, title:'Heart rate rising three logs in a row',
      text:'Resting heart rate went from ' + hrs[0].hr + ' to ' + hrs[2].hr + ' bpm.',
      action:'Recheck at rest, review sleep, fluids and stress, and tell the flight surgeon if it keeps climbing.'});
  }
  patterns.forEach(p => { score -= p.sev === 2 ? 10 : 6; });
  score = Math.max(0, Math.min(100, Math.round(score)));

  let status = 0;
  ORDER.forEach(k => { if (metrics[k].sev > status) status = metrics[k].sev; });
  patterns.forEach(p => { if (p.sev > status) status = p.sev; });
  return {metrics, patterns, score, status, radCum:cum, radPct:pct};
}

function toCSV(crewList){
  const head = ['crew','role','day'].concat(ORDER);
  const q = s => '"' + String(s).replace(/"/g,'""') + '"';
  const rows = [head.join(',')];
  crewList.forEach(c => byDay(c.entries).forEach(e => {
    rows.push([q(c.name), q(c.role||''), e.day].concat(ORDER.map(k => e[k] == null ? '' : e[k])).join(','));
  }));
  return rows.join('\n');
}

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seedCrew(){
  const rnd = mulberry32(2026);
  const n = a => (rnd() - 0.5) * 2 * a;
  const base = {hr:62, spo2:97.6, sys:118, dia:76, rr:15, temp:36.6, sleep:7.1, stress:3, ex:125, water:2.6, rad:680};
  const make = (id, name, role, tweak) => {
    const entries = [];
    for (let d = 1; d <= 14; d++) {
      const t = tweak(d);
      const v = k => (base[k] + (t[k] || 0));
      entries.push({
        day:d,
        hr: Math.round(v('hr') + n(2)),
        spo2: Math.min(100, +(v('spo2') + n(0.5)).toFixed(1)),
        sys: Math.round(v('sys') + n(3)),
        dia: Math.round(v('dia') + n(2)),
        rr: Math.round(v('rr') + n(1)),
        temp: +(v('temp') + n(0.12)).toFixed(1),
        sleep: Math.max(0, +(v('sleep') + n(0.4)).toFixed(1)),
        stress: Math.max(1, Math.min(10, Math.round(v('stress') + n(1)))),
        ex: Math.round(v('ex') + n(15)),
        water: +(v('water') + n(0.2)).toFixed(1),
        rad: Math.max(0, Math.round(v('rad') + n(60)))
      });
    }
    return {id, name, role, example:true, entries};
  };
  return [
    make('ex1', 'Cmdr. A. Rivera', 'Commander', () => ({})),
    make('ex2', 'J. Okafor', 'Flight engineer', d => d === 12 ? {hr:4,temp:0.2,sleep:-0.8,stress:1,rr:1,spo2:-0.5,water:-0.3}
      : d === 13 ? {hr:9,temp:0.5,sleep:-1.6,stress:3,rr:3,spo2:-1,water:-0.6}
      : d === 14 ? {hr:16,temp:0.8,sleep:-2.4,stress:4,rr:5,spo2:-1.7,water:-0.9} : {}),
    make('ex3', 'K. Lindqvist', 'Mission specialist', d => d === 13 ? {rad:850,sleep:-0.4} : d === 14 ? {rad:1950,sleep:-0.6} : {})
  ];
}

/* ---------- UI ---------- */
const KEY = 'astrovitals.v1';
let state = {crew:[], active:null};
let armed = null, armTimer = null, editingDay = null;

const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let apiConnected = false;
let apiSaveQueue = Promise.resolve();

async function load(){
  // The API is the shared source of truth when this page is served by server.js.
  // Opening index.html directly still works with this browser's local storage.
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw new Error('API unavailable');
    const payload = await response.json();
    if (payload && Array.isArray(payload.crew)) {
      state = payload;
      apiConnected = true;
    }
  } catch (e) {
    apiConnected = false;
  }
  if (!apiConnected) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && Array.isArray(s.crew)) state = s; }
  } catch (e) {}
  }
  if (!state.crew.length && !state.seeded) { state.crew = seedCrew(); state.seeded = true; }
  if (!state.crew.find(c => c.id === state.active)) state.active = state.crew[0] ? state.crew[0].id : null;
  if (apiConnected) save();
}
function save(){
  const snapshot = JSON.stringify(state);
  try { localStorage.setItem(KEY, snapshot); } catch (e) {}
  if (apiConnected) {
    apiSaveQueue = apiSaveQueue.then(() => fetch('/api/state', {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:snapshot
    })).then(async response => {
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Could not save to the shared project data file.');
      }
    }).catch(error => { toast('Local copy saved. Shared save failed: ' + error.message); });
  }
}
function active(){ return state.crew.find(c => c.id === state.active) || null; }
function uid(){ return 'c' + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36); }

let toastTimer = null;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}
function arm(key){
  armed = key; clearTimeout(armTimer);
  armTimer = setTimeout(() => { armed = null; renderRail(); renderSummary(); }, 4000);
}

function latest(c){ const e = byDay(c.entries); return e.length ? e[e.length - 1] : null; }
function evalLatest(c){ const l = latest(c); return l ? evalEntry(c.entries, l) : null; }

/* --- rail --- */
function renderRail(){
  const list = $('#crewList');
  if (!state.crew.length) {
    list.innerHTML = '<p class="empty">No crew yet. Add a crew member below.</p>';
  } else {
    list.innerHTML = state.crew.map(c => {
      const ev = evalLatest(c);
      const l = latest(c);
      const cls = ev ? 's' + ev.status : '';
      return '<button type="button" class="crewbtn" data-action="select" data-id="' + esc(c.id) + '"' + (c.id === state.active ? ' aria-current="true"' : '') + '>' +
        '<span class="dot ' + cls + '" aria-hidden="true"></span>' +
        '<span class="txt"><span class="nm">' + esc(c.name) + '</span><span class="rl">' + esc(c.role || 'Crew') + (l ? ' · Day ' + l.day : ' · no readings') + '</span></span></button>';
    }).join('');
  }
  const total = state.crew.reduce((a, c) => a + c.entries.length, 0);
  $('#missionStats').innerHTML = '<span><b>' + state.crew.length + '</b> crew</span><span><b>' + total + '</b> readings logged</span>';
  $('#exampleBtn').hidden = state.crew.some(c => c.example);
  const cb = $('#clearBtn');
  cb.classList.toggle('armed', armed === 'clear');
  cb.textContent = armed === 'clear' ? 'Click again to erase everything' : 'Clear all data';
}

/* --- summary --- */
function ring(score, cls){
  const r = 40, C = 2 * Math.PI * r, dash = (score == null ? 0 : score / 100) * C;
  return '<div class="ring ' + cls + '"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="' + r + '"/>' +
    '<circle class="arc" cx="50" cy="50" r="' + r + '" transform="rotate(-90 50 50)" stroke-dasharray="' + dash.toFixed(1) + ' ' + C.toFixed(1) + '"/></svg>' +
    '<div class="big"><div>' + (score == null ? '—' : score) + '<small>readiness</small></div></div></div>';
}
function renderSummary(){
  const c = active();
  const work = $('#work'), log = $('#logWrap');
  if (!c) {
    work.hidden = true; log.hidden = true;
    $('#sumWrap').innerHTML = '<div class="bigempty"><h2>No crew on the roster</h2><p>Add a crew member in the left panel, then log their first readings. Every card, alert and trend on this page is calculated from what you enter.</p>' +
      '<button class="btn primary" type="button" data-action="load-example">Load example crew</button></div>';
    return;
  }
  work.hidden = false; log.hidden = false;
  const ev = evalLatest(c), l = latest(c);
  const cls = ev ? 's' + ev.status : 'sn';
  const label = ev ? SEV_NAME[ev.status] : 'No data';
  $('#sumWrap').innerHTML =
    '<div class="summary"><div class="sumleft">' + ring(ev ? ev.score : null, cls) +
    '<div class="sumtext"><h2>' + esc(c.name) + (c.example ? '<span class="badge">Example</span>' : '') + '</h2>' +
    '<p class="sub">' + esc(c.role || 'Crew member') + (l ? ' · latest log Day ' + l.day + ' · ' + c.entries.length + ' readings' : ' · nothing logged yet') + '</p>' +
    '<p style="margin-top:8px"><span class="pill ' + cls + '">' + label + '</span></p></div></div>' +
    '<div class="sumactions"><button class="btn primary" type="button" data-action="goto-form">Log readings</button>' +
    '<button class="btn danger' + (armed === 'crew' ? ' armed' : '') + '" type="button" data-action="del-crew">' + (armed === 'crew' ? 'Click again to remove' : 'Remove crew member') + '</button></div></div>';
}

/* --- findings --- */
function renderFindings(){
  const c = active(); if (!c) return;
  const ev = evalLatest(c), l = latest(c);
  let html = '<div class="sechead"><h3>Findings</h3><span>' + (l ? 'From Day ' + l.day + ' against limits and this person’s own baseline' : '') + '</span></div>';
  if (!ev) {
    html += '<p class="empty">Nothing to assess yet. Log a first set of readings and findings appear here right away. Personal baselines start after four logged days.</p>';
    $('#findWrap').innerHTML = html; return;
  }
  const items = [];
  ORDER.forEach(k => {
    const m = ev.metrics[k];
    if (m.sev >= 1 && m.msgs.length) items.push({sev:m.sev, title:SPECS[k].label, msgs:m.msgs});
  });
  const pats = ev.patterns.map(p => ({sev:p.sev, title:p.title, msgs:[p.text], action:p.action}));
  const all = pats.concat(items).sort((a, b) => b.sev - a.sev);
  if (!all.length) {
    html += '<div class="allclear">All logged readings are inside their limits and close to this person’s baseline.</div>';
  } else {
    html += '<div class="findings">' + all.map(f =>
      '<div class="finding s' + f.sev + '"><div class="ft"><span class="chip s' + f.sev + '">' + SEV_NAME[f.sev] + '</span><strong>' + esc(f.title) + '</strong></div>' +
      (f.msgs.length > 1 ? '<ul>' + f.msgs.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>' : '<div>' + esc(f.msgs[0]) + '</div>') +
      (f.action ? '<div class="act"><b>Suggested next step:</b> ' + esc(f.action) + '</div>' : '') + '</div>').join('') + '</div>';
  }
  $('#findWrap').innerHTML = html;
}

/* --- metrics --- */
function spark(c, k, ev){
  const W = 200, H = 52, padL = 4, padR = 8, padT = 6, padB = 6;
  const es = byDay(c.entries).slice(-14);
  const pts = es.filter(e => e[k] != null);
  if (pts.length < 2) return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Not enough data for a trend"><line class="grid" x1="0" x2="' + W + '" y1="' + (H/2) + '" y2="' + (H/2) + '"/><text x="4" y="' + (H/2 - 4) + '">Needs 2+ logs for a trend</text></svg>';
  const b = ev && ev.metrics[k].base;
  let lo = Math.min.apply(null, pts.map(e => e[k])), hi = Math.max.apply(null, pts.map(e => e[k]));
  if (b) { lo = Math.min(lo, b.mean - b.sd); hi = Math.max(hi, b.mean + b.sd); }
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.1; lo -= pad; hi += pad;
  const d0 = es[0].day, d1 = es[es.length - 1].day, span = Math.max(1, d1 - d0);
  const X = d => padL + (d - d0) / span * (W - padL - padR);
  const Y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  let out = '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(SPECS[k].short) + ' over the last ' + es.length + ' logs">';
  out += '<line class="grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + (H - padB) + '" y2="' + (H - padB) + '"/>';
  if (b) out += '<rect class="band" x="' + padL + '" width="' + (W - padL - padR) + '" y="' + Y(b.mean + b.sd).toFixed(1) + '" height="' + Math.max(1, Y(b.mean - b.sd) - Y(b.mean + b.sd)).toFixed(1) + '" rx="2"/>';
  out += '<polyline class="line" points="' + pts.map(e => X(e.day).toFixed(1) + ',' + Y(e[k]).toFixed(1)).join(' ') + '"/>';
  pts.slice(0, -1).forEach(e => { out += '<circle class="pt" cx="' + X(e.day).toFixed(1) + '" cy="' + Y(e[k]).toFixed(1) + '" r="1.6"/>'; });
  const last = pts[pts.length - 1];
  out += '<circle class="end s' + Math.max(0, judgeSev(c, k, last)) + '" cx="' + X(last.day).toFixed(1) + '" cy="' + Y(last[k]).toFixed(1) + '" r="3.6"/>';
  out += '</svg>';
  return out;
}
function judgeSev(c, k, entry){ return evalEntry(c.entries, entry).metrics[k].sev; }

function renderMetrics(){
  const c = active(); if (!c) return;
  const ev = evalLatest(c), l = latest(c);
  let html = '<div class="sechead"><h3>Readings</h3><span>Shaded band on each trend is the personal baseline (mean ± 1 SD)</span></div>';
  if (!ev) { html += '<p class="empty">Readings appear here as soon as you log them.</p>'; $('#metricWrap').innerHTML = html; return; }
  html += '<div class="mgrid">' + ORDER.map(k => {
    const s = SPECS[k], m = ev.metrics[k];
    const sev = m.sev;
    const chip = sev < 0 ? '<span class="chip sn">No reading</span>' : '<span class="chip s' + sev + '">' + SEV_NAME[sev] + '</span>';
    let meta;
    if (m.v == null) meta = 'Not logged on Day ' + l.day;
    else if (m.base) { const dlt = m.v - m.base.mean; meta = 'Base ' + fmt(k, m.base.mean) + ' · ' + (dlt >= 0 ? '+' : '') + dlt.toFixed(s.dec === 0 ? 1 : s.dec) + ' ' + s.unit; }
    else meta = 'Normal ' + s.typical + (s.base ? ' · baseline after 4 logs' : '');
    let extra = '';
    if (k === 'rad') {
      const p = ev.radPct, cls = p >= 1 ? 's2' : p >= 0.8 ? 's1' : '';
      extra = '<div class="dose"><div class="bar"><i class="' + cls + '" style="width:' + Math.min(100, p * 100).toFixed(1) + '%"></i></div><p>30-day dose ' + (ev.radCum / 1000).toFixed(1) + ' of ' + (RAD_LIMIT_30D / 1000) + ' mSv demo limit</p></div>';
    }
    return '<article class="mcard" data-sev="' + sev + '"><div class="mh"><span class="mn">' + esc(s.label) + '</span>' + chip + '</div>' +
      '<div class="mv"><span class="num">' + fmt(k, m.v) + '</span><span class="unit">' + esc(s.unit) + '</span></div>' +
      '<div class="mm">' + esc(meta) + '</div>' + spark(c, k, ev) + extra + '</article>';
  }).join('') + '</div>';
  $('#metricWrap').innerHTML = html;
}

/* --- form --- */
const FIELDS = [
  {g:'Heart, blood and breathing', ks:['hr','spo2','sys','dia','rr','temp']},
  {g:'Recovery and workload', ks:['sleep','stress','ex','water']},
  {g:'Environment', ks:['rad']}
];
function renderForm(prefill){
  const c = active(); if (!c) return;
  const es = byDay(c.entries);
  const nextDay = es.length ? es[es.length - 1].day + 1 : 1;
  const p = prefill || {};
  const day = p.day != null ? p.day : nextDay;
  let h = '<h3>' + (editingDay != null ? 'Edit Day ' + editingDay : 'Log readings') + '</h3>' +
    '<p class="hint">For ' + esc(c.name) + '. Leave blank anything not measured. Colors show each value against its limit as you type.</p>' +
    '<form id="logForm" novalidate autocomplete="off"><div class="fgrid"><div class="fld wide"><label for="f-day">Mission day</label><div class="inp"><input id="f-day" name="day" type="number" inputmode="numeric" min="1" step="1" value="' + day + '"><span class="u">day</span></div><div class="live">Saving an existing day replaces it.</div></div></div>';
  FIELDS.forEach(g => {
    h += '<div class="grp"><div class="label">' + g.g + '</div><div class="fgrid">' + g.ks.map(k => {
      const s = SPECS[k];
      const val = p[k] != null ? p[k] : '';
      return '<div class="fld' + (k === 'rad' ? ' wide' : '') + '" data-k="' + k + '"><label for="f-' + k + '">' + esc(s.label) + '</label><div class="inp"><input id="f-' + k + '" name="' + k + '" type="number" inputmode="decimal" step="any" placeholder="' + esc(s.typical) + '" value="' + val + '"><span class="u">' + esc(s.unit) + '</span></div><div class="live"></div></div>';
    }).join('') + '</div></div>';
  });
  h += '<div class="formerr" id="formErr" role="alert"></div><div class="formact"><button class="btn primary" type="submit">' + (editingDay != null ? 'Update Day ' + editingDay : 'Save readings') + '</button>' +
    (editingDay != null ? '<button class="btn" type="button" data-action="cancel-edit">Cancel</button>' : '') + '</div></form>';
  $('#formWrap').innerHTML = h;
  FIELDS.forEach(g => g.ks.forEach(k => liveCheck(k)));
}
function liveCheck(k){
  const fld = $('.fld[data-k="' + k + '"]'); if (!fld) return;
  const input = $('input', fld), live = $('.live', fld), s = SPECS[k];
  const raw = input.value.trim();
  if (raw === '' || isNaN(Number(raw))) { fld.removeAttribute('data-sev'); live.textContent = ''; return; }
  const j = judge(s, Number(raw));
  fld.setAttribute('data-sev', j.sev);
  if (j.sev === 0) live.textContent = 'Within range';
  else live.textContent = SEV_NAME[j.sev] + ': ' + (j.dir === 'low' ? 'below ' : 'above ') + fmt(k, j.limit) + ' ' + s.unit;
}
function submitLog(form){
  const c = active(); if (!c) return;
  const err = [];
  const dayRaw = form.elements.day.value.trim();
  const day = Number(dayRaw);
  if (dayRaw === '' || !Number.isInteger(day) || day < 1) err.push('Mission day must be a whole number, 1 or higher.');
  const entry = {day};
  let any = false;
  ORDER.forEach(k => {
    const raw = form.elements[k].value.trim();
    if (raw === '') { entry[k] = null; return; }
    const v = Number(raw), s = SPECS[k];
    if (isNaN(v)) { err.push(s.label + ' must be a number.'); return; }
    if (v < s.min || v > s.max) { err.push(s.label + ' should be between ' + s.min + ' and ' + s.max + ' ' + s.unit + '.'); return; }
    if (k === 'stress' && !Number.isInteger(v)) { err.push('Stress is a whole number from 1 to 10.'); return; }
    entry[k] = v; any = true;
  });
  if (!any && !err.length) err.push('Enter at least one reading.');
  if (entry.sys != null && entry.dia != null && entry.sys <= entry.dia) err.push('Systolic pressure must be higher than diastolic.');
  if (err.length) { $('#formErr').innerHTML = err.map(esc).join('<br>'); return; }
  c.entries = c.entries.filter(e => e.day !== day);
  c.entries.push(entry);
  c.entries = byDay(c.entries);
  editingDay = null;
  save();
  const ev = evalEntry(c.entries, entry);
  renderAll(true);
  toast('Saved Day ' + day + ' for ' + c.name + '. Status: ' + SEV_NAME[ev.status] + '.');
}

/* --- log table --- */
function renderLog(){
  const c = active(); if (!c) return;
  const es = byDay(c.entries);
  let html = '<div class="sechead"><h3>Log</h3><span>' + es.length + ' readings. Highlighted cells are outside limits or their baseline.</span></div>';
  if (!es.length) { html += '<p class="empty">The log is empty. Saved readings are listed here, newest first.</p>'; $('#logWrap').innerHTML = html; return; }
  const cols = [['hr','HR'],['spo2','SpO₂'],['bp','BP'],['rr','RR'],['temp','Temp'],['sleep','Sleep'],['stress','Stress'],['ex','Ex min'],['water','Fluids'],['rad','µSv']];
  html += '<div class="tablewrap"><table><thead><tr><th>Day</th>' + cols.map(x => '<th>' + x[1] + '</th>').join('') + '<th>Score</th><th></th></tr></thead><tbody>';
  es.slice().reverse().forEach(e => {
    const ev = evalEntry(c.entries, e);
    const cell = (k) => { const m = ev.metrics[k]; return '<td class="' + (m.sev > 0 ? 'c' + m.sev : '') + '">' + fmt(k, m.v) + '</td>'; };
    const bpSev = Math.max(ev.metrics.sys.sev, ev.metrics.dia.sev);
    const bp = '<td class="' + (bpSev > 0 ? 'c' + bpSev : '') + '">' + (e.sys == null && e.dia == null ? '—' : fmt('sys', e.sys) + '/' + fmt('dia', e.dia)) + '</td>';
    html += '<tr><td>' + e.day + '</td>' + cols.map(x => x[0] === 'bp' ? bp : cell(x[0])).join('') + '<td class="' + (ev.status > 0 ? 'c' + ev.status : '') + '">' + ev.score + '</td>' +
      '<td class="act"><button type="button" data-action="edit" data-day="' + e.day + '">Edit</button><button type="button" data-action="del-entry" data-day="' + e.day + '">Delete</button></td></tr>';
  });
  html += '</tbody></table></div>';
  $('#logWrap').innerHTML = html;
}

function renderAll(resetForm){
  renderRail(); renderSummary();
  if (!active()) return;
  renderFindings(); renderMetrics(); renderLog();
  if (resetForm) renderForm();
}

/* --- events --- */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-action]'); if (!t) return;
  const a = t.dataset.action, c = active();
  if (a === 'select') { state.active = t.dataset.id; editingDay = null; armed = null; save(); renderAll(true); }
  else if (a === 'goto-form') { const f = $('#f-hr') || $('#f-day'); $('#formWrap').scrollIntoView({behavior:'smooth', block:'center'}); if (f) setTimeout(() => f.focus({preventScroll:true}), 250); }
  else if (a === 'load-example') {
    const ex = seedCrew(); state.crew = state.crew.concat(ex); state.seeded = true;
    if (!state.active) state.active = ex[0].id;
    save(); renderAll(true); toast('Example crew added. Remove it any time.');
  }
  else if (a === 'clear-all') {
    if (armed !== 'clear') { arm('clear'); renderRail(); return; }
    armed = null; state = {crew:[], active:null, seeded:true}; editingDay = null; save(); renderAll(true); toast('All data cleared.');
  }
  else if (a === 'del-crew') {
    if (armed !== 'crew') { arm('crew'); renderSummary(); return; }
    armed = null; state.crew = state.crew.filter(x => x.id !== c.id); state.active = state.crew[0] ? state.crew[0].id : null; editingDay = null; save(); renderAll(true); toast('Crew member removed.');
  }
  else if (a === 'edit') {
    const e = c.entries.find(x => x.day === Number(t.dataset.day)); if (!e) return;
    editingDay = e.day; renderForm(e); $('#formWrap').scrollIntoView({behavior:'smooth', block:'center'});
  }
  else if (a === 'cancel-edit') { editingDay = null; renderForm(); }
  else if (a === 'del-entry') {
    const d = Number(t.dataset.day); c.entries = c.entries.filter(x => x.day !== d); if (editingDay === d) editingDay = null;
    save(); renderAll(true); toast('Deleted Day ' + d + '.');
  }
  else if (a === 'copy-csv') {
    const text = toCSV(state.crew), box = $('#csvBox');
    const fallback = () => { box.hidden = false; box.value = text; box.focus(); box.select(); toast('Copy was blocked. The CSV is selected below, press Ctrl+C.'); };
    try { navigator.clipboard.writeText(text).then(() => toast('CSV copied to clipboard.'), fallback); } catch (e) { fallback(); }
  }
});
document.addEventListener('submit', ev => {
  ev.preventDefault();
  if (ev.target.id === 'logForm') submitLog(ev.target);
  else if (ev.target.id === 'addCrew') {
    const name = $('#newName').value.trim();
    if (!name) { toast('Enter a name first.'); $('#newName').focus(); return; }
    const c = {id:uid(), name:name, role:$('#newRole').value.trim(), entries:[]};
    state.crew.push(c); state.active = c.id; editingDay = null; save();
    $('#newName').value = ''; $('#newRole').value = '';
    renderAll(true); toast(name + ' added. Log the first readings.');
  }
});
document.addEventListener('input', ev => {
  const f = ev.target.closest && ev.target.closest('.fld[data-k]');
  if (f) liveCheck(f.dataset.k);
});

load().then(() => renderAll(true));
````


## `server.js`

````javascript
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { validateEntry, validateState } = require('./modules/dataValidator');
const { evaluateEntry, buildReport } = require('./modules/healthEngine');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');
const PORT = Number(process.env.PORT) || 3000;
const CONTENT_TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
let writeQueue = Promise.resolve();

async function readState() {
  try {
    const value = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
    const errors = validateState(value);
    if (errors.length) throw new Error('Stored data is invalid: ' + errors[0].message);
    return value;
  } catch (error) {
    if (error.code === 'ENOENT') return { crew: [], active: null, seeded: false };
    throw error;
  }
}

function writeState(state) {
  const snapshot = JSON.stringify(state, null, 2) + '\n';
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const temp = DATA_FILE + '.tmp';
    await fs.writeFile(temp, snapshot, 'utf8');
    await fs.rename(temp, DATA_FILE);
  });
  return writeQueue;
}

function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 2_000_000) throw Object.assign(new Error('Request body exceeds 2 MB.'), { status: 413 });
  }
  try { return JSON.parse(raw || '{}'); }
  catch { throw Object.assign(new Error('Request body must contain valid JSON.'), { status: 400 }); }
}

function invalid(res, errors) {
  return send(res, 400, { error: 'VALIDATION_ERROR', message: 'The submitted data did not pass validation.', details: errors });
}

async function api(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, await readState());
  if (req.method === 'PUT' && url.pathname === '/api/state') {
    const state = await readBody(req);
    const errors = validateState(state);
    if (errors.length) return invalid(res, errors);
    await writeState(state);
    return send(res, 200, { saved: true });
  }
  if (req.method === 'GET' && url.pathname === '/api/crew') {
    const state = await readState();
    return send(res, 200, state.crew.map(({ id, name, role, entries }) => ({ id, name, role: role || '', recordCount: entries.length })));
  }
  if (req.method === 'POST' && url.pathname === '/api/crew') {
    const body = await readBody(req);
    const state = await readState();
    const member = { id: randomUUID(), name: body.name, role: body.role || '', entries: [] };
    state.crew.push(member);
    state.active = member.id;
    const errors = validateState(state);
    if (errors.length) return invalid(res, errors);
    await writeState(state);
    return send(res, 201, member);
  }

  const match = url.pathname.match(/^\/api\/crew\/([^/]+)(?:\/(history|readings|health|report))?$/);
  if (!match) return send(res, 404, { error: 'NOT_FOUND', message: 'API route not found.' });
  let id;
  try { id = decodeURIComponent(match[1]); }
  catch { return send(res, 400, { error: 'BAD_ID', message: 'Crew id is not valid URL encoding.' }); }
  const action = match[2] || '';
  const state = await readState();
  const member = state.crew.find(person => person.id === id);
  if (!member) return send(res, 404, { error: 'CREW_NOT_FOUND', message: 'Crew member was not found.' });

  if (req.method === 'GET' && action === 'history') return send(res, 200, member.entries.slice().sort((a, b) => a.day - b.day));
  if (req.method === 'POST' && action === 'readings') {
    const entry = await readBody(req);
    const errors = validateEntry(entry, 'reading');
    if (errors.length) return invalid(res, errors);
    member.entries = member.entries.filter(row => row.day !== entry.day);
    member.entries.push(entry);
    member.entries.sort((a, b) => a.day - b.day);
    await writeState(state);
    return send(res, 200, { saved: true, reading: entry });
  }
  if (req.method === 'GET' && action === 'health') {
    const day = url.searchParams.has('day') ? Number(url.searchParams.get('day')) : null;
    const entry = day == null ? member.entries.slice().sort((a, b) => a.day - b.day).at(-1) : member.entries.find(row => row.day === day);
    if (!entry) return send(res, 404, { error: 'READING_NOT_FOUND', message: 'No reading exists for that mission day.' });
    return send(res, 200, evaluateEntry(member.entries, entry));
  }
  if (req.method === 'GET' && action === 'report') return send(res, 200, buildReport(member));
  if (req.method === 'DELETE' && action === '') {
    state.crew = state.crew.filter(person => person.id !== id);
    if (state.active === id) state.active = state.crew[0]?.id || null;
    await writeState(state);
    return send(res, 200, { deleted: true, id });
  }
  return send(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'That method is not supported for this route.' }, { Allow: 'GET, POST, DELETE' });
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL.'); }
  const file = path.resolve(ROOT, '.' + decoded);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden.'); }
  try {
    const content = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': CONTENT_TYPES[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') { res.writeHead(404); return res.end('Not found.'); }
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return await serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res, error.status || 500, { error: 'SERVER_ERROR', message: error.status ? error.message : 'The server could not complete the request.' });
    else res.end();
  }
});

server.listen(PORT, () => console.log(`AstroVitals is running at http://localhost:${PORT}`));
````


## `modules/dataValidator.js`

````javascript
const SPECS = {
  hr: { label: 'Resting heart rate', min: 20, max: 250 },
  spo2: { label: 'Blood oxygen (SpO2)', min: 50, max: 100 },
  sys: { label: 'Systolic pressure', min: 50, max: 260 },
  dia: { label: 'Diastolic pressure', min: 30, max: 160 },
  rr: { label: 'Respiratory rate', min: 4, max: 60 },
  temp: { label: 'Body temperature', min: 30, max: 43 },
  sleep: { label: 'Sleep', min: 0, max: 24 },
  stress: { label: 'Stress', min: 1, max: 10, integer: true },
  ex: { label: 'Exercise', min: 0, max: 600 },
  water: { label: 'Fluid intake', min: 0, max: 10 },
  rad: { label: 'Radiation dose', min: 0, max: 100000 }
};
const ENTRY_KEYS = new Set(['day', ...Object.keys(SPECS)]);

function validateEntry(entry, path = 'entry') {
  const errors = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return [{ path, message: 'must be an object' }];
  }
  for (const key of Object.keys(entry)) {
    if (!ENTRY_KEYS.has(key)) errors.push({ path: `${path}.${key}`, message: 'is not a supported field' });
  }
  if (!Number.isInteger(entry.day) || entry.day < 1) {
    errors.push({ path: `${path}.day`, message: 'must be a whole mission day of 1 or higher' });
  }
  for (const [key, spec] of Object.entries(SPECS)) {
    if (!Object.hasOwn(entry, key) || entry[key] === null) continue;
    const value = entry[key];
    if (!Number.isFinite(value)) {
      errors.push({ path: `${path}.${key}`, message: 'must be a finite number or null' });
      continue;
    }
    if (value < spec.min || value > spec.max) {
      errors.push({ path: `${path}.${key}`, message: `must be between ${spec.min} and ${spec.max}` });
    }
    if (spec.integer && !Number.isInteger(value)) {
      errors.push({ path: `${path}.${key}`, message: 'must be a whole number' });
    }
  }
  if (Number.isFinite(entry.sys) && Number.isFinite(entry.dia) && entry.sys <= entry.dia) {
    errors.push({ path: `${path}.sys`, message: 'must be higher than diastolic pressure' });
  }
  return errors;
}

function validateState(state) {
  const errors = [];
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return [{ path: 'body', message: 'must be a JSON object' }];
  }
  if (!Array.isArray(state.crew)) return [{ path: 'crew', message: 'must be an array' }];
  if (state.crew.length > 100) errors.push({ path: 'crew', message: 'cannot contain more than 100 crew members' });
  const ids = new Set();
  state.crew.forEach((member, index) => {
    const path = `crew[${index}]`;
    if (!member || typeof member !== 'object' || Array.isArray(member)) {
      errors.push({ path, message: 'must be an object' });
      return;
    }
    if (typeof member.id !== 'string' || !member.id.trim()) errors.push({ path: `${path}.id`, message: 'must be a non-empty string' });
    else if (ids.has(member.id)) errors.push({ path: `${path}.id`, message: 'must be unique' });
    else ids.add(member.id);
    if (typeof member.name !== 'string' || !member.name.trim()) errors.push({ path: `${path}.name`, message: 'must be a non-empty string' });
    else if (member.name.length > 80) errors.push({ path: `${path}.name`, message: 'must be 80 characters or fewer' });
    if (member.role != null && (typeof member.role !== 'string' || member.role.length > 80)) {
      errors.push({ path: `${path}.role`, message: 'must be text of 80 characters or fewer' });
    }
    if (!Array.isArray(member.entries)) {
      errors.push({ path: `${path}.entries`, message: 'must be an array' });
      return;
    }
    if (member.entries.length > 10000) errors.push({ path: `${path}.entries`, message: 'contains too many records' });
    const days = new Set();
    member.entries.forEach((entry, entryIndex) => {
      const entryPath = `${path}.entries[${entryIndex}]`;
      errors.push(...validateEntry(entry, entryPath));
      if (entry && Number.isInteger(entry.day)) {
        if (days.has(entry.day)) errors.push({ path: `${entryPath}.day`, message: 'mission day must be unique for this crew member' });
        days.add(entry.day);
      }
    });
  });
  if (state.active != null && (typeof state.active !== 'string' || !ids.has(state.active))) {
    errors.push({ path: 'active', message: 'must be null or the id of a crew member in crew' });
  }
  if (state.seeded != null && typeof state.seeded !== 'boolean') errors.push({ path: 'seeded', message: 'must be a boolean' });
  return errors;
}

module.exports = { SPECS, validateEntry, validateState };
````


## `modules/healthEngine.js`

````javascript
const { SPECS } = require('./dataValidator');

const LIMITS = {
  hr: { alertLo: 40, watchLo: 50, watchHi: 90, alertHi: 100, baseline: 2, direction: 'both' },
  spo2: { alertLo: 92, watchLo: 95, baseline: 0.5, direction: 'low' },
  sys: { alertLo: 85, watchLo: 90, watchHi: 129, alertHi: 139, baseline: 3, direction: 'both' },
  dia: { alertLo: 55, watchLo: 60, watchHi: 84, alertHi: 89, baseline: 2, direction: 'both' },
  rr: { alertLo: 10, watchLo: 12, watchHi: 20, alertHi: 24, baseline: 1, direction: 'both' },
  temp: { alertLo: 35.5, watchLo: 36.1, watchHi: 37.2, alertHi: 37.9, baseline: 0.15, direction: 'both' },
  sleep: { alertLo: 5.5, watchLo: 6.5, baseline: 0.4, direction: 'low' },
  stress: { watchHi: 5, alertHi: 7 },
  ex: { alertLo: 30, watchLo: 90 },
  water: { alertLo: 1.5, watchLo: 2 },
  rad: { watchHi: 1000, alertHi: 2000 }
};
const RAD_30_DAY_LIMIT = 250000;
const ORDER = Object.keys(SPECS);

function severity(key, value) {
  if (value == null) return -1;
  const t = LIMITS[key];
  if (t.alertLo != null && value < t.alertLo) return 2;
  if (t.alertHi != null && value > t.alertHi) return 2;
  if (t.watchLo != null && value < t.watchLo) return 1;
  if (t.watchHi != null && value > t.watchHi) return 1;
  return 0;
}

function baseline(entries, entry, key) {
  if (LIMITS[key].baseline == null) return null;
  const values = entries.filter(row => row.day < entry.day && row[key] != null)
    .sort((a, b) => a.day - b.day).slice(-7).map(row => row[key]);
  if (values.length < 4) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
  return { mean, sd: Math.max(sd, LIMITS[key].baseline), n: values.length };
}

function evaluateEntry(entries, entry) {
  const metrics = {};
  let score = 100;
  let status = 0;
  for (const key of ORDER) {
    const value = entry[key] ?? null;
    let level = severity(key, value);
    const base = value == null ? null : baseline(entries, entry, key);
    let z = null;
    if (base) {
      z = (value - base.mean) / base.sd;
      const deviation = LIMITS[key].direction === 'low' ? -z : Math.abs(z);
      level = Math.max(level, deviation >= 3 ? 2 : deviation >= 2 ? 1 : 0);
    }
    const messages = [];
    if (value != null && severity(key, value) > 0) messages.push(`${SPECS[key].label} is outside its prototype reference range.`);
    if (base && Math.abs(z) >= 2) messages.push(`${SPECS[key].label} differs from the crew member's recent baseline.`);
    metrics[key] = { value, severity: level, baseline: base, zScore: z, messages };
    if (level === 1) score -= 4;
    if (level === 2) score -= 10;
    if (level > status) status = level;
  }

  const recentRad = entries.filter(row => row.day > entry.day - 30 && row.day <= entry.day && row.rad != null)
    .reduce((sum, row) => sum + row.rad, 0);
  const radiationPercent = recentRad / RAD_30_DAY_LIMIT;
  const alerts = [];
  const addAlert = (id, level, title, detail, action) => alerts.push({ id, severity: level, title, detail, action });
  if (metrics.sleep.severity >= 1 && metrics.stress.severity >= 1 && (metrics.hr.severity >= 1 || (metrics.hr.zScore != null && metrics.hr.zScore >= 1.5))) {
    addAlert('fatigue', metrics.sleep.severity === 2 || metrics.stress.severity === 2 ? 2 : 1,
      'Fatigue and strain pattern', 'Short sleep, high stress and a raised heart rate are showing together.',
      'Protect a full sleep period, lighten non-critical tasks, and tell the flight surgeon if this continues another two days.');
  }
  if (metrics.temp.severity >= 1 && (metrics.hr.severity >= 1 || metrics.rr.severity >= 1)) {
    addAlert('illness', metrics.temp.severity === 2 && (metrics.hr.severity === 2 || metrics.rr.severity === 2) ? 2 : 1,
      'Possible infection pattern', 'Temperature is out of range along with a raised heart or breathing rate.',
      'Retake temperature after 10 minutes of rest and contact the flight surgeon if it remains elevated.');
  }
  if (metrics.spo2.severity >= 1 && metrics.rr.severity >= 1) {
    addAlert('respiratory', metrics.spo2.severity === 2 ? 2 : 1, 'Breathing and oxygen pattern',
      'Low blood oxygen is paired with an abnormal breathing rate.',
      'Check sensor fit, retake the reading, and check cabin CO2 and ventilation. Escalate if confirmed.');
  }
  if (metrics.water.severity >= 1 && (metrics.hr.severity >= 1 || (metrics.hr.zScore != null && metrics.hr.zScore >= 1.5))) {
    addAlert('hydration', 1, 'Hydration pattern', 'Low fluid intake is paired with a raised heart rate.',
      'Increase fluids over the next several hours and recheck heart rate.');
  }
  if (metrics.rad.severity === 2 || radiationPercent >= 0.8) {
    addAlert('radiation', radiationPercent >= 1 || metrics.rad.severity === 2 ? 2 : 1, 'Radiation exposure',
      radiationPercent >= 0.8 ? `The 30-day dose is at ${Math.round(radiationPercent * 100)}% of the demo reference limit.` : 'Today’s dose is far above the usual daily prototype level.',
      'Move to the best-shielded area and follow the radiation event checklist. Report the reading to mission control.');
  }
  const rowsToDate = entries.filter(row => row.day <= entry.day).sort((a, b) => a.day - b.day);
  const sleep = rowsToDate.filter(row => row.sleep != null).slice(-3);
  if (sleep.length === 3 && sleep.reduce((sum, row) => sum + row.sleep, 0) / 3 < 6.5) {
    const average = sleep.reduce((sum, row) => sum + row.sleep, 0) / 3;
    addAlert('sleep-trend', 1, 'Sleep debt building', `Sleep over the last three logs averages ${average.toFixed(1)} hours.`,
      'Plan a protected sleep block and review the work schedule with the commander.');
  }
  const heartRates = rowsToDate.filter(row => row.hr != null).slice(-3);
  if (heartRates.length === 3 && heartRates[0].hr < heartRates[1].hr && heartRates[1].hr < heartRates[2].hr && heartRates[2].hr - heartRates[0].hr >= 8) {
    addAlert('heart-rate-trend', 1, 'Heart rate rising three logs in a row',
      `Resting heart rate went from ${heartRates[0].hr} to ${heartRates[2].hr} bpm.`,
      'Recheck at rest, review sleep, fluids and stress, and tell the flight surgeon if it keeps climbing.');
  }
  for (const alert of alerts) {
    score -= alert.severity === 2 ? 10 : 6;
    status = Math.max(status, alert.severity);
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { day: entry.day, score, status, metrics, alerts, radiation: { dose30Day: recentRad, referencePercent: radiationPercent } };
}

function buildReport(member) {
  const entries = member.entries.slice().sort((a, b) => a.day - b.day);
  const daily = entries.map(entry => evaluateEntry(entries, entry));
  const latest = daily[daily.length - 1] || null;
  const trends = {};
  for (const key of ORDER) {
    const values = entries.filter(entry => entry[key] != null);
    trends[key] = values.length < 2 ? { readings: values.length, change: null } : {
      readings: values.length,
      firstDay: values[0].day,
      latestDay: values[values.length - 1].day,
      firstValue: values[0][key],
      latestValue: values[values.length - 1][key],
      change: Number((values[values.length - 1][key] - values[0][key]).toFixed(2))
    };
  }
  return {
    generatedAt: new Date().toISOString(),
    crew: { id: member.id, name: member.name, role: member.role || '' },
    recordCount: entries.length,
    latest,
    trends,
    alertHistory: daily.flatMap(day => day.alerts.map(alert => ({ day: day.day, ...alert })))
  };
}

module.exports = { evaluateEntry, buildReport, severity };
````
