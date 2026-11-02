import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync(new URL('../assets/title-signboard/C2/manifest.json',import.meta.url)));
test('final tall loop is the supplied CTO loop without re-encoding or old crop32 footage',()=>{
 assert.deepEqual(manifest.size,[2036,1016]);
 assert.match(manifest.source,/tall-final\/loop\.mp4$/);
 const bytes=fs.readFileSync(new URL('../'+manifest.runtime,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sourceSHA256);
 assert.equal(manifest.layout,'cover');
});
