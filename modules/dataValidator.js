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
