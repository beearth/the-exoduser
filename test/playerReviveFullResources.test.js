import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i += 1) {
    if (gameHtml[i] === '{') depth += 1;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

test('fallen player revival restores HP, MP, and ST to their maximums', () => {
  const source = extractFunction('_fallenResolve');
  const P = {
    _fallenCanRevive: true,
    _fallenRevRoll: 0,
    _fallenRevChance: 100,
    _fallenRevCdFrames: 6000,
    mhp: 100,
    mmp: 80,
    mst: 200,
    hp: 0,
    mp: 0,
    st: 0,
    s: 'fallen',
  };
  const PASSIVES = { pDemon: 0 };
  const G = { slowMo: 0, shake: 0 };
  const OPT = { shake: 100 };
  const SFX = { levelup() {} };
  const calls = [];
  const playSample = (...args) => calls.push(['playSample', ...args]);
  const addTxt = () => {};
  const _petSayCD = () => {};
  const _petOnDeath = () => {};
  const poolPart = () => {};
  const _r = () => 1;
  const _T = (value) => value;
  const fn = Function(
    'P', 'PASSIVES', 'G', 'OPT', 'SFX', 'playSample', 'addTxt', '_petSayCD', '_petOnDeath', 'poolPart', '_r', '_T',
    `${source}; return _fallenResolve;`,
  )(P, PASSIVES, G, OPT, SFX, playSample, addTxt, _petSayCD, _petOnDeath, poolPart, _r, _T);

  fn();

  assert.equal(P.hp, P.mhp);
  assert.equal(P.mp, P.mmp);
  assert.equal(P.st, P.mst);
});

test('one-time armor revival restores HP, MP, and ST to their maximums', () => {
  const dieSource = extractFunction('die');
  const P = {
    _reviveOnceUsed: false,
    mhp: 100,
    mmp: 80,
    mst: 200,
    hp: 0,
    mp: 0,
    st: 0,
    iframes: 0,
  };
  const _eqAffix = () => 0.3;
  const fn = Function(
    'P', 'ultUnmute', '_eqAffix', 'playSample', 'addTxt', '_T',
    `${dieSource}; return die;`,
  )(P, () => {}, _eqAffix, () => {}, () => {}, (value) => value);

  fn();

  assert.equal(P.hp, P.mhp);
  assert.equal(P.mp, P.mmp);
  assert.equal(P.st, P.mst);
});
