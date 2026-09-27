import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  '../index.html',
  '../game.html',
  '../out/EXODUSER-steam-languages-20260923/package.nw/index.html',
  '../out/EXODUSER-steam-languages-20260923/package.nw/game.html',
];

test('Steam demo language selectors identify the advertised Spanish and Portuguese regions', async () => {
  for (const file of files) {
    const html = await readFile(new URL(file, import.meta.url), 'utf8');
    const spanish = [...html.matchAll(/<option value="es">([^<]+)<\/option>/g)].map((match) => match[1]);
    const portuguese = [...html.matchAll(/<option value="ptbr">([^<]+)<\/option>/g)].map((match) => match[1]);
    assert.ok(spanish.length > 0, `${file}: Spanish selector missing`);
    assert.equal(portuguese.length, spanish.length, `${file}: regional selector count mismatch`);
    assert.ok(spanish.every((label) => label === 'Español (España)'), `${file}: Spanish region unclear`);
    assert.ok(portuguese.every((label) => label === 'Português (Brasil)'), `${file}: Portuguese region unclear`);
  }
});
