import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={};vm.runInNewContext(fs.readFileSync(new URL('../title-signboard.js',import.meta.url),'utf8'),scope);
const api=scope.TitleSignboard;
test('every title viewport uses the same unprocessed final video without decode variants',()=>{
 for(const width of [1280,1920,2560,3840])assert.equal(api.videoSource(width),'video/title_motion_C2_final_20261102.mp4');
});
