import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function api(){const scope={};vm.runInNewContext(fs.readFileSync(new URL('../living-scenes.js',import.meta.url),'utf8'),scope);return scope.LivingScenes;}
test('background motion stops for accessibility, low quality, proxy GPU and hidden documents',()=>{
 const s=api();
 for(const input of [{reduce:true},{tier:'C'},{quality:'low'},{renderer:'Google SwiftShader'},{hidden:true}])assert.ok(s.staticReason(input));
 assert.equal(s.staticReason({tier:'A',quality:'high',renderer:'NVIDIA RTX'}),null);
});
test('approved title and gate are excluded while only the 32 allowed loading plates animate',()=>{
 const s=api();assert.equal(typeof s.loadingId,'function');
 for(const n of [13,14,17])assert.equal(s.loadingId(`img/lording/wide/${n}-32.webp?v=1`),null);
 for(const source of ['img/lording/1.png','img/lording/wide/19-21.webp','img/lording/rd11.jpg','img/lording/wide/rd17-16.webp'])assert.ok(s.loadingId(source));
 for(const source of ['img/lording/22.png','img/lording/rd18.png','img/title_bg_20261028.jpg','img/hellgate.png'])assert.equal(s.loadingId(source),null);
 assert.equal(s.allowedScreen('splashOverlay'),false);assert.equal(s.allowedScreen('cinClickPrompt'),false);assert.equal(s.allowedScreen('fdgScreen'),false);assert.equal(s.allowedScreen('lobby'),true);
});
test('saved reduce-motion and atmosphere-off settings select the exact static fallback',()=>{
 const s=api();assert.equal(s.staticReason({settings:{reduceMotion:true}}),'reduced-motion');
 assert.equal(s.staticReason({settings:{atmos:0}}),'atmosphere-off');
 assert.equal(s.staticReason({settings:{quality:'low'}}),'low-tier');
});
test('wind layers loop continuously at 96 seconds and remain subtle',()=>{
 const s=api();for(let layer=0;layer<3;layer++){assert.ok(s.period(layer)>=60);const a=s.wind(0,layer),b=s.wind(s.period(layer),layer);assert.ok(Math.abs(a-b)<1e-9);for(let t=0;t<200;t++)assert.ok(Math.abs(s.wind(t,layer))<=1);}
});
test('painting insertion follows actual plate dimensions rather than a rounded viewport ratio',()=>{
 const s=api();assert.deepEqual(Array.from(s.plateBox(1931,814,{width:1931,height:814},1931,814)),[0,0,1931,814]);
 assert.deepEqual(Array.from(s.plateBox(7680,2160,{width:3840,height:2160},3840,1080)),[960,0,1920,1080]);
});
