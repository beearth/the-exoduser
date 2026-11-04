'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const shader=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Resources/Shaders/HudPrototype.shader'),'utf8');
function value(name){const match=shader.match(new RegExp('const float '+name+'=([0-9.]+)'));assert.ok(match,'H1 render contract absent: '+name);return Number(match[1]);}
const center=value('EmptyDiamondCenter'),half=value('EmptyDiamondHalfBand');
assert.ok(Math.abs((center+half)/Math.SQRT2-3)<.00001,'empty CSS6x6 border-box outer half-side3');
assert.ok(Math.abs((center-half)/Math.SQRT2-2)<.00001,'empty border has1px thickness');
const radial=value('NotchHalfLength'),tangent=value('NotchHalfWidth');assert.equal(radial,3);assert.equal(tangent,1);
const cover=d=>Math.max(0,Math.min(1,.5-d));
for(const d of [0,1,2,2.5])assert.equal(cover(Math.abs(d)-radial),1,'notch remains opaque outside3px resource stroke at dr='+d);
assert.equal(cover(3.6-radial),0,'outside6px notch is clear');assert.equal(cover(1.6-tangent),0,'outside2px width is clear');
const shadow=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Resources/Shaders/HudPrototypeTextShadow.shader'),'utf8');
assert.ok(shadow.includes('Text-shadow Gaussian'),'new blur shader required');
assert.ok(shadow.includes('exp(-.5 * offset * offset / (sigma * sigma))'),'normalized Gaussian mask samples');
console.log('PASS 16 HUD prototype diamond/notch/soft-shadow contracts');
