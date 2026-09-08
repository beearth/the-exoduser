import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function pngContract(url) {
  const data = readFileSync(url);
  assert.equal(data.toString('ascii', 1, 4), 'PNG');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), colorType: data[25] };
}

test('Chain Flame and Chain Impact use opaque black additive sheets on the shared WebGL VFX path', () => {
  const flameUrl = new URL('../assets/vfx/chain_assault_impact_realistic.png', import.meta.url);
  const slamUrl = new URL('../assets/vfx/chain_slam_impact_realistic.png', import.meta.url);

  assert.ok(existsSync(flameUrl), 'Chain Flame impact sheet must exist');
  assert.ok(existsSync(slamUrl), 'Chain Impact impact sheet must exist');
  assert.deepEqual(pngContract(flameUrl), { width: 1254, height: 1254, colorType: 2 });
  assert.deepEqual(pngContract(slamUrl), { width: 1254, height: 1254, colorType: 2 });

  assert.match(gameHtml, /registerVFX\('chain_assault_impact','assets\/vfx\/chain_assault_impact_realistic\.png',418,418,9,3\);/);
  assert.match(gameHtml, /registerVFX\('chain_slam_impact','assets\/vfx\/chain_slam_impact_realistic\.png',418,418,9,3\);/);
  assert.doesNotMatch(gameHtml, /_vfxGLMode&&sh\.blend!=='source-over'&&_queueVfxGL/);
  assert.match(gameHtml, /playVFXAng\('chain_slam_impact',P\.x,P\.y-_csR\*0\.28,_csR\/256,12,0,true\)/);
  assert.match(gameHtml, /playVFXAng\('chain_assault_impact',P\.x,P\.y-_stR\*0\.19,_stR\/384,12,0,true\)/);
});
