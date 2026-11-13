# AstroVitals submission notes

## Project

- **Project name:** AstroVitals
- **Challenge:** Create Health Monitoring Software for Astronauts on Space Missions
- **Hackathon:** NASA Space Apps Challenge 2026
- **Team:** [Enter the registered team name]
- **Team members:** [Enter all registered member names]
- **Project/demo link:** [Add after choosing where to host or share the demo]
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

## Demo checklist

- Start with `npm start` or double-click `start-astrovitals.bat`.
- Open `http://localhost:3000` on the same computer.
- Click **Load example crew** to demonstrate trend and alert behavior. Explain that these crew entries are synthetic.
- Scroll to **NASA ISS radiation data** to show the sourced environmental telemetry and attribution.
- Add a crew member and save a sample reading to demonstrate validation and JSON persistence.
- Remove any personal data before sharing the project folder. Runtime state is local and excluded from the project ZIP.

## Limitations to disclose

This is a hackathon prototype, not medical software. Alert limits are demo settings and are not validated clinical criteria. The app does not diagnose or prescribe. The local demo has no sign-in, encryption, hosted database, or multi-user synchronization. NASA’s data in this prototype are environmental radiation readings, not personal astronaut vital data.
