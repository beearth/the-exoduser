import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('friendly reflected projectiles use projectile size and speed for enemy contact', () => {
  assert.match(
    gameHtml,
    /if\(!_pHit&&p\.friendly\)\{const _fHitR=Math\.max\(6,\(p\.r\|\|4\)\+Math\.min\(18,Math\.sqrt\(p\.vx\*p\.vx\+p\.vy\*p\.vy\)\*0\.5\)\);const _ne3=shQuery\(p\.x,p\.y,_fHitR\+20\);/
  );
  assert.match(
    gameHtml,
    /if\(dst\(p\.x,p\.y,e\.x,e\.y\)<e\.r\+_fHitR\)\{if\(p\.friendly&&p\.redBean\)e\._bluHitCD=3;/
  );
});
