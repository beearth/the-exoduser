import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync(new URL('../assets/title-signboard/C2/manifest.json',import.meta.url)));
test('registered 4K title composite retains approved close motion and hashes all delivery sizes',()=>{
 assert.deepEqual(manifest.size,[3840,1920]);
 assert.match(manifest.source,/close-final\/loop\.mp4$/);
 assert.equal(manifest.maskFrames,206);
 assert.ok(manifest.registration.medianError4K<2);
 assert.equal(manifest.layout,'cover');
 for(const width of [1920,2560,3840]){
  const media=manifest.variants[String(width)];assert.deepEqual(media.size,[width,width/2]);
  const bytes=fs.readFileSync(new URL('../'+media.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),media.sha256);
  assert.ok(bytes.length<50_000_000);
 }
});
