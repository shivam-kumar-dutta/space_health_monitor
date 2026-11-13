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
