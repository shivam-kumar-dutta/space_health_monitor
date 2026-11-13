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
