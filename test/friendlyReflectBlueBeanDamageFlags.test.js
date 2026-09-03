import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('friendly reflected projectile hit path forwards blue bean damage flags', () => {
  assert.match(
    gameHtml,
    /hurtE\(be,~~\(_blD\*\(.8\+bf\*\.2\)\),ba,false,\{kbMult:2,magic:!!p\.magic,blueBean:!!p\.blueBean,parryBlueBean:!!p\.parryBlueBean\},p\.el\);/
  );
  assert.match(
    gameHtml,
    /hurtE\(re,~~\(_rbD\*\(.5\+rf\*\.5\)\),ra2,false,_isBlue\?\{kbMult:3,noPoise:true,magic:!!p\.magic,blueBean:!!p\.blueBean,parryBlueBean:!!p\.parryBlueBean\}:\{kbMult:3,magic:!!p\.magic,blueBean:!!p\.blueBean,parryBlueBean:!!p\.parryBlueBean\},p\.el\);/
  );
});
