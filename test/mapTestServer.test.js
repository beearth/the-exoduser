import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../tools/local-static-server.mjs';

const ROOT = new URL('..', import.meta.url);

function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(error => (error ? reject(error) : resolve(port)));
    });
  });
}

test('map test mode opens its hub and provides safe stage shortcuts', async t => {
  const port = await findFreePort();
  const server = createStaticServer({
    rootDir: fileURLToPath(ROOT),
    host: '127.0.0.1',
    mapTestMode: true
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));

  const base = `http://127.0.0.1:${port}`;
  const root = await fetch(`${base}/`, { redirect: 'manual' });
  assert.equal(root.status, 302);
  assert.equal(root.headers.get('location'), '/map-test.html');

  const rebuiltField = await fetch(`${base}/map/field`, { redirect: 'manual' });
  assert.equal(rebuiltField.status, 302);
  assert.equal(rebuiltField.headers.get('location'), '/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1&fieldrebuild=1');

  const first = await fetch(`${base}/map/0`, { redirect: 'manual' });
  assert.equal(first.status, 302);
  assert.equal(first.headers.get('location'), '/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1');

  const ch2Entrance = await fetch(`${base}/map/4`, { redirect: 'manual' });
  assert.equal(ch2Entrance.status, 302);
  assert.equal(ch2Entrance.headers.get('location'), '/game.html?test=1&testchar=1&stage=4&classic=1&mapqa=1&combatqa=1');

  const last = await fetch(`${base}/map/34`, { redirect: 'manual' });
  assert.equal(last.status, 302);
  assert.equal(last.headers.get('location'), '/game.html?test=1&testchar=1&stage=34&classic=1&mapqa=1');

  const invalid = await fetch(`${base}/map/35`);
  assert.equal(invalid.status, 404);
});

test('map test hub lists every stage and builds classic-map preview URLs', async () => {
  const hubUrl = new URL('../map-test.html', import.meta.url);
  assert.equal(existsSync(hubUrl), true, 'map-test.html should exist');
  const html = await readFile(hubUrl, 'utf8');
  assert.match(html, /const CHAPTERS\s*=\s*\[/);
  assert.match(html, /stages:\s*7/);
  assert.match(html, /stage=\$\{stage\}&classic=1&mapqa=1/);
  assert.match(html, /iframe/);
  assert.match(html, /href="\/map\/field"[^>]*>지옥 필드 실험맵</);
  assert.doesNotMatch(html, /\.innerHTML\s*=/, 'hub must not replace parent DOM with innerHTML');
});

test('map QA mode suppresses combat encounters while keeping the game simulation active', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /const _MAP_QA_MODE=.*get\('mapqa'\)==='1'/);
  assert.match(game, /if\(_MAP_QA_MODE&&!_MAP_QA_COMBAT\)\{ens\.length=0;G\.spawnHoles\.length=0/);
  assert.match(game, /if\(_MAP_QA_MODE\)G\._bonfire=null;/,
    'map inspection must not be covered by the opening bonfire barrier');
  assert.match(game, /P\.iframes=_MAP_QA_MODE\?999999:120/);
  assert.match(game, /function _dispatchSkillSlot\(slotIdx,keyCode\)\{\s*if\(_MAP_QA_MODE\)return false;/,
    'map inspection must not be obscured by player skill effects');
  assert.match(game, /function _petBidCD\([^)]*\)\{\s*if\(_MAP_QA_MODE\)return false;/,
    'map inspection must not be obscured by tutorial pet dialogue');
});

test('CH2-1 map QA can opt into an invulnerable monster combat preview', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  const hub = await readFile(new URL('../map-test.html', import.meta.url), 'utf8');

  assert.match(game, /const _MAP_QA_COMBAT=_MAP_QA_MODE&&_stageTestReq===4&&.*get\('combatqa'\)==='1'/,
    'combat preview must be explicit and scoped to CH2-1');
  assert.match(game, /if\(_MAP_QA_MODE&&!_MAP_QA_COMBAT\)\{ens\.length=0;G\.spawnHoles\.length=0/,
    'ordinary map QA must remain encounter-free');
  assert.match(game, /if\(_MAP_QA_MODE\)G\._bonfire=null;/,
    'the opening barrier must not obscure either map inspection mode');
  assert.match(hub, /id="combat"/,
    'map hub needs a visible monster preview control');
  assert.match(hub, /let combatPreview=stage===4/,
    'CH2-1 should open with its monsters visible for review');
  assert.match(hub, /combatPreview\?'&combatqa=1':''/,
    'combat preview must be expressed through the explicit URL flag');
});

test('map QA uses the same resolution and backing pixels as normal gameplay', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  const start=game.indexOf('function rz(){');
  const end=game.indexOf('  // If nothing changed',start);
  const body=game.slice(start+'function rz(){'.length,end);
  const calculate=Function('innerWidth','innerHeight','devicePixelRatio','_MAP_QA_MODE','OPT',
    'let _dpr,VW,VH,_ssaa;const _MAP_QA_HIDPI=_MAP_QA_MODE,_renderRes=null,IS_MOBILE=false;const document={getElementById:()=>null};'+body+';return {VW,VH,bw,bh,cssW,cssH,_ssaa};');
  for(const [w,h,dpr] of [[1280,720,1],[1920,1080,2],[2560,1440,3]])for(const resScale of [100,75]){
    const normal=calculate(w,h,dpr,false,{resScale});
    const qa=calculate(w,h,dpr,true,{resScale});
    assert.deepEqual(qa,normal);
    assert.equal(qa.bw,qa.VW);assert.equal(qa.bh,qa.VH);
    assert.equal(qa.VW,Math.floor(w*resScale/100)&~1);
  }
});
