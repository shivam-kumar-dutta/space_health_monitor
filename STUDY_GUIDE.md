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
