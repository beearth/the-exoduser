import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync(new URL('../assets/title-signboard/C2/manifest.json',import.meta.url)));
test('packaged title is byte-identical to the supplied final loop, with only waterfall assets',()=>{
 assert.deepEqual(manifest.size,[2036,1016]);
 assert.match(manifest.source,/final-main\/loop\.mp4$/);
 assert.equal(manifest.layout,'cover');
 const bytes=fs.readFileSync(new URL('../'+manifest.runtime,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sourceSHA256);
 assert.equal(bytes.length,manifest.bytes);
 assert.deepEqual(manifest.overlays,['skull-waterfalls']);
 for(const name of ['fall-near.png','fall-far.png']){
  const mask=fs.readFileSync(new URL('../assets/title-signboard/C2/'+name,import.meta.url));
  assert.equal(createHash('sha256').update(mask).digest('hex'),manifest.maskHashes[name]);
 }
});
