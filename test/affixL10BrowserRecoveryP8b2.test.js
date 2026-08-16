import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const harness = readFileSync(new URL('../tools/verify_affix_transfer_browser.mjs', import.meta.url), 'utf8');

// Isolate the L10 bounded-step runner body for structural assertions.
const L10 = (() => {
  const s = harness.indexOf('async function runL10Only');
  assert.ok(s >= 0, 'runL10Only present');
  const e = harness.indexOf('async function main', s);
  return harness.slice(s, e > 0 ? e : undefined);
})();

test('8B.2 harness exposes an isolated L10 section', () => {
  assert.match(harness, /--section=l10/, 'l10 section flag');
  assert.match(harness, /runL10Only/, 'isolated runner');
  assert.match(harness, /blackStar|BlackStar/, 'BlackStar proof present');
});

test('8B.2 §12 stale fixture chooses an actually absorbable stone (not pool-only)', () => {
  assert.match(harness, /planAbsorption\(w,\s*stone\)\.ok/, 'fixture uses domain plan, not pool-only pick');
});

test('8B.2 BlackStar proof runs a BOUNDED step (no full-cast/real-time replay)', () => {
  // exactly-once production update() against a directly-constructed active BlackStar state.
  assert.match(L10, /const before=e\.x;\s*update\(\)/, 'single bounded update() step');
  // must NOT wait on the real RAF loop or replay the whole cast — that was the 90s-hang cause.
  assert.doesNotMatch(L10, /requestAnimationFrame/, 'no RAF wait in bounded step');
  assert.doesNotMatch(L10, /while\s*\(/, 'no unbounded update loop in bounded step');
  assert.doesNotMatch(L10, /P\._bsT\s*>=\s*_bsDur|_bsDur/, 'does not drive the cast to completion');
  // real loop must be neutralised at teardown so it never runs free.
  assert.match(L10, /G\.on=false/, 'clears G.on at teardown');
});

test('8B.2 BlackStar proof asserts a REAL displacement ratio (not just _ultDmgMul)', () => {
  assert.match(L10, /moved:before-e\.x/, 'measures actual enemy position mutation');
  assert.match(L10, /D0>0\?D1\/D0:0|D1\s*\/\s*D0/, 'ratio = powered/baseline displacement');
  assert.match(L10, /pull ratio = 1\.5/, 'asserts 1.5 pull ratio');
});

test('8B.2 BlackStar proof has zero-denominator safety + damage/geometry invariants', () => {
  assert.match(L10, /BLACKSTAR_FIXTURE_INVALID/, 'D0<=0 → fixture invalid, not arbitrary PASS');
  assert.match(L10, /no damage \(hurtE count 0/, 'no-damage invariant (hurtE=0, HP delta 0)');
  assert.match(L10, /radius\/duration\/cooldown invariant/, 'radius/duration/cooldown unchanged L10-A off→on');
  assert.match(L10, /hits=\[\]/, 'resets the shared hurtE sink per step (no stale-count leak)');
});
