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
let nasaRadiationData;
async function renderNasaData(){
  const wrap = $('#nasaDataWrap');
  if (!wrap) return;
  try {
    if (!nasaRadiationData) {
      const response = await fetch('/data/nasa-iss-radiation.json');
      if (!response.ok) throw new Error('NASA sample data could not be loaded.');
      nasaRadiationData = await response.json();
    }
    const rows = nasaRadiationData.records || [];
    const latest = rows[rows.length - 1];
    wrap.innerHTML = '<div class="sechead"><h3>NASA ISS radiation data</h3><span>Real environmental telemetry · separate from crew health readings</span></div>' +
      '<p class="nasa-copy">NASA OSDR RadLab sample from the ISS DosTel instruments. Absorbed dose rate is shown in µGy/hour; it is not a crew member’s medical reading and is not added to the health score.</p>' +
      '<div class="nasa-stats"><div><span>Latest sample</span><strong>' + (latest ? latest.absorbed_dose_rate_ugy_per_hour.toFixed(2) + ' µGy/h' : 'Unavailable') + '</strong></div>' +
      '<div><span>Records in this sample</span><strong>' + rows.length + '</strong></div>' +
      '<div><span>ISS sample window</span><strong>Apr 1–2, 2022 (UTC)</strong></div></div>' +
      '<div class="tablewrap"><table><thead><tr><th>Time (UTC)</th><th>Instrument</th><th>Absorbed dose rate</th></tr></thead><tbody>' +
      rows.slice(-6).reverse().map(row => '<tr><td>' + esc(row.timestamp.replace('T',' ')) + '</td><td>' + esc(row.instrument) + '</td><td>' + Number(row.absorbed_dose_rate_ugy_per_hour).toFixed(4) + ' µGy/h</td></tr>').join('') +
      '</tbody></table></div><p class="nasa-credit">Data courtesy of the <a href="' + esc(nasaRadiationData.source_url) + '" target="_blank" rel="noopener noreferrer">NASA Open Science Data Repository (OSDR) RadLab</a>. <a href="' + esc(nasaRadiationData.query_url) + '" target="_blank" rel="noopener noreferrer">View the source query</a>. NASA reports RadLab data as preliminary.</p>';
  } catch (error) {
    wrap.innerHTML = '<div class="sechead"><h3>NASA ISS radiation data</h3><span>Sample unavailable</span></div><p class="nasa-copy">Start AstroVitals with the included local server to view its NASA data snapshot.</p>';
  }
}

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
  renderNasaData();
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
