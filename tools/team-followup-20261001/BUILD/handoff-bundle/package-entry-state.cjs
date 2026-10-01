const { EventEmitter } = require('node:events');
module.exports = function createEntryState(port) {
  const events = new EventEmitter();
  const state = { phase: 'pending', host: '127.0.0.1', port, code: null };
  return {
    snapshot() { return { ...state }; },
    subscribe(callback) { events.on('change', callback); return () => events.removeListener('change', callback); },
    ready() {
      if (state.phase !== 'pending') return;
      state.phase = 'ready'; events.emit('change', { ...state });
    },
    failed(code) {
      if (state.phase === 'failed') return;
      state.phase = 'failed'; state.code = code || 'UNKNOWN'; events.emit('change', { ...state });
    }
  };
};
