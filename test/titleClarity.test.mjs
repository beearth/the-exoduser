import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={};vm.runInNewContext(fs.readFileSync(new URL('../title-signboard.js',import.meta.url),'utf8'),scope);
const api=scope.TitleSignboard;
test('title decode width follows the physical cover width including tall 1080p screens',()=>{
 assert.equal(typeof api.videoWidth,'function');
 for(const [w,h,dpr,expected] of [[1920,1080,1,2560],[2560,1080,1,2560],[3840,1080,1,3840],[1280,720,1,1920],[1920,1080,1.5,3840],[3840,2160,1,3840]])assert.equal(api.videoWidth(w,h,dpr),expected);
});
test('clarity source mapping has no aspect jump when decode size changes',()=>{
 assert.equal(typeof api.videoSource,'function');
 for(const width of [1920,2560,3840])assert.match(api.videoSource(width),new RegExp('clarity_'+width+'_20261102\\.mp4$'));
});
