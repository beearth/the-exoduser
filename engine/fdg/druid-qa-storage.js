/* Explicit r4 caller storage. This classic helper never replaces native APIs. */
(function (scope) {
  'use strict';

  const key = 'fdg.qa.dark-druid.encounter.r4';
  const notesLimit = 128;
  const settingsFields = new Set(['binds', 'binds2', 'opt', 'charIdx', 'inputMode', 'gpKeyMap', 'language', 'screen', 'presets']);
  const forbiddenQueries = ['editor', 'demo', 'bic', 'char', 'booth', 'mapqa', 'projectilelab', 'dropPreview', 'stage'];
  let active = false;
  try {
    const url = new URL(scope.location.href);
    const query = url.searchParams;
    active = ['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '3333' && url.pathname === '/game.html'
      && query.get('test') === '1' && query.get('testchar') === '1' && query.get('bosstest') === '0'
      && query.get('fdgDruidQa') === 'r4' && !forbiddenQueries.some(name => query.has(name));
  } catch {}

  const memory = new Map();
  const reads = [], writes = [], notes = [];
  const memoryOperations = { getItem: 0, setItem: 0, removeItem: 0 };
  let successfulWrites = 0, notesTotal = 0, ownSettingsRestored = false, ownSettings = {};
  const clone = value => JSON.parse(JSON.stringify(value));
  const plainObject = value => {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
  };
  const safeJson = (value, path = new Set()) => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || path.has(value) || (!Array.isArray(value) && !plainObject(value))) return false;
    path.add(value);
    const valid = Array.isArray(value)
      ? Array.from({ length: value.length }, (_, index) => index).every(index => Object.hasOwn(value, index) && safeJson(value[index], path))
      : Object.keys(value).every(name => !['__proto__', 'constructor', 'prototype'].includes(name) && safeJson(value[name], path));
    path.delete(value);
    return valid;
  };
  const validateSettings = settings => {
    if (!plainObject(settings) || !safeJson(settings) || Object.keys(settings).some(name => !settingsFields.has(name))) return null;
    for (const name of ['binds', 'binds2', 'opt']) {
      if (Object.hasOwn(settings, name) && !plainObject(settings[name])) return null;
    }
    for (const name of ['gpKeyMap', 'screen', 'presets']) {
      if (Object.hasOwn(settings, name) && settings[name] !== null && !plainObject(settings[name])) return null;
    }
    if (Object.hasOwn(settings, 'charIdx') && (!Number.isInteger(settings.charIdx) || settings.charIdx < 0 || settings.charIdx > 1)) return null;
    if (Object.hasOwn(settings, 'inputMode') && !['kbm', 'pad'].includes(settings.inputMode)) return null;
    if (Object.hasOwn(settings, 'language') && typeof settings.language !== 'string') return null;
    return clone(settings);
  };
  const note = (event, detail = null) => {
    if (!active || typeof event !== 'string' || !event) return false;
    notesTotal++;
    notes.push({ event, detail: safeJson(detail) ? clone(detail) : null });
    if (notes.length > notesLimit) notes.shift();
    return true;
  };
  const restoreMemorySettings = settings => {
    if (['binds', 'binds2', 'opt'].some(name => Object.hasOwn(settings, name))) {
      memory.set('hellcave_settings', JSON.stringify({ binds: settings.binds || {}, binds2: settings.binds2 || {}, opt: settings.opt || {} }));
    }
    if (Object.hasOwn(settings, 'charIdx')) memory.set('_charIdx', String(settings.charIdx));
    if (Object.hasOwn(settings, 'inputMode')) memory.set('inputMode', settings.inputMode);
    if (Object.hasOwn(settings, 'language')) memory.set('hellLang', settings.language);
    for (const [field, storageKey] of [['gpKeyMap', 'gpKeyMap'], ['screen', 'hellcave_screen']]) {
      if (settings[field] !== undefined && settings[field] !== null) memory.set(storageKey, JSON.stringify(settings[field]));
    }
    if (settings.presets) for (const slot of ['1', '2']) {
      const value = settings.presets[slot];
      if (value !== undefined && value !== null) memory.set('hellcave_preset_' + slot, typeof value === 'string' ? value : JSON.stringify(value));
    }
  };

  if (active) {
    memory.set('hellcave_sharedStorage', '[]'); memory.set('hellcave_sharedMats', '0');
    memory.set('_charIdx', '0'); memory.set('inputMode', 'kbm'); memory.set('hellLang', 'ko');
    try {
      reads.push(key);
      const raw = scope.localStorage.getItem(key);
      if (raw !== null && raw !== undefined) {
        const payload = JSON.parse(raw);
        const settings = plainObject(payload) && payload.schemaVersion === 1
          && Object.keys(payload).every(name => ['schemaVersion', 'settings'].includes(name))
          && Object.hasOwn(payload, 'settings') ? validateSettings(payload.settings) : null;
        if (settings) {
          ownSettings = settings; ownSettingsRestored = true; restoreMemorySettings(settings);
          note('own-settings-restored');
        } else note('own-settings-invalid');
      }
    } catch { note('own-settings-read-failed'); }
  }

  const api = {
    active,
    key,
    getItem(name) {
      if (!active) return null;
      memoryOperations.getItem++;
      return memory.get(String(name)) ?? null;
    },
    setItem(name, value) {
      if (!active) return false;
      memoryOperations.setItem++;
      memory.set(String(name), String(value));
      return true;
    },
    removeItem(name) {
      if (!active) return false;
      memoryOperations.removeItem++;
      memory.delete(String(name));
      return true;
    },
    note,
    saveOwn(settings) {
      if (!active) return false;
      const validated = validateSettings(settings);
      if (!validated) { note('own-settings-save-invalid'); return false; }
      try {
        writes.push(key);
        scope.localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, settings: validated }));
        successfulWrites++; ownSettings = validated;
        note('own-settings-saved');
        return true;
      } catch { note('own-settings-save-failed'); return false; }
    },
    get ownSettings() { return clone(ownSettings); },
    receipt() {
      return { active, key, reads: [...reads], writes: [...writes], successfulWrites,
        memoryOperations: { ...memoryOperations }, notes: clone(notes), notesTotal, notesLimit, ownSettingsRestored };
    },
  };
  scope._FDGDruidQaStorage = Object.freeze(api);
})(typeof window !== 'undefined' ? window : globalThis);
