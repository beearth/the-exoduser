const fs = require('node:fs');
const path = require('node:path');
const nodeProcess = require('node:process');
const scenario = nodeProcess.env.EXODUSER_CONTEXT_CASE || 'ready-before';
const cases = ['ready-before', 'ready-after', 'error-before', 'error-after', 'pending', 'missing'];
if (!cases.includes(scenario)) throw new Error('Unknown probe scenario');
const events = require('node:events');
const emitter = new events.EventEmitter();
const state = { phase: 'pending', host: '127.0.0.1', port: 3347, code: null };
let sequence = 0;
function record(event, details = {}) {
  fs.appendFileSync(path.join(__dirname, 'probe-log.ndjson'), JSON.stringify({ at: new Date().toISOString(), sequence: ++sequence, scenario, event, details }) + '\n');
}
function change(phase, code = null) {
  if (state.phase === 'failed') return;
  state.phase = phase; state.code = code;
  record('simulated-state', { ...state }); emitter.emit('change', { ...state });
}
const entry = {
  snapshot: () => ({ ...state }),
  subscribe(callback) { emitter.on('change', callback); return () => emitter.removeListener('change', callback); }
};
nodeProcess.__exoduserContextDiagnostic = {
  scenario,
  sameProcess: candidate => candidate === nodeProcess,
  record,
  pageAttached() {
    record('page-attached');
    if (scenario === 'ready-after') setTimeout(() => change('ready'), 100);
    if (scenario === 'error-after') setTimeout(() => change('failed', 'EADDRINUSE'), 100);
  }
};
if (scenario !== 'missing') nodeProcess.__exoduserPackageEntry = entry;
else delete nodeProcess.__exoduserPackageEntry;
record('node-main-start', { versions: { nw: nodeProcess.versions.nw || null, chromium: nodeProcess.versions.chromium || null, node: nodeProcess.versions.node }, execPath: nodeProcess.execPath, socketUsed: false });
if (scenario === 'ready-before') change('ready');
if (scenario === 'error-before') change('failed', 'EACCES');
