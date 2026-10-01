import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import * as backend from 'canvas';
import pngjs from 'pngjs';

const root=new URL('../../../',import.meta.url);
const owned=new URL('./',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const raw=read('output/imagegen/item-skins/ring_phys.png');
const evidence=read('docs/0마스터플랜/mac-resume-20261001/ring-png-evidence/ring_phys_masked.png');
assert.equal(sha(raw),'2f3a05692db24dbd36562681921ac72613fd97e44c3210083a4324805355137e');
assert.equal(sha(evidence),'812b47358d293d3dc2c154ab5989470add22eb3f1bb7f2edf9f78cde16da0a96');
const html=read('game.html').toString(),start=html.indexOf('function _maskWorldDropBlack(');
const maskSource=html.slice(start,parseExpressionAt(html,start,{ecmaVersion:'latest'}).end);
assert.equal(sha(maskSource),'1a8a563ba924b94577e1c53164c373ffadc371c039ed6ab93ff37bb853ab226f');
const context=vm.createContext({});vm.runInContext(maskSource,context);
const canvasFrom=async buffer=>{
  const image=await backend.loadImage(buffer),canvas=backend.createCanvas(image.width,image.height);
  canvas.getContext('2d').drawImage(image,0,0);return canvas;
};
const pixels=canvas=>canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
const compare=(left,right)=>{
  assert.equal(left.length,right.length);
  let rgbDiff=0,alphaDiff=0,maxRgbDelta=0,maxAlphaDelta=0,partialRgbDiff=0,opaqueRgbDiff=0,zeroRgbDiff=0;
  for(let index=0;index<left.length;index++){
    const delta=Math.abs(left[index]-right[index]);if(!delta)continue;
    if(index%4===3){alphaDiff++;maxAlphaDelta=Math.max(maxAlphaDelta,delta);}
    else{rgbDiff++;maxRgbDelta=Math.max(maxRgbDelta,delta);const alpha=left[index-index%4+3];if(alpha===0)zeroRgbDiff++;else if(alpha===255)opaqueRgbDiff++;else partialRgbDiff++;}
  }
  return {rgbDiff,alphaDiff,rgbaDiff:rgbDiff+alphaDiff,maxRgbDelta,maxAlphaDelta,partialRgbDiff,opaqueRgbDiff,zeroRgbDiff};
};
const rows=[];
const record=(stage,left,right)=>{const diff=compare(left,right);rows.push({stage,...diff});return diff;};
const rawFile=pngjs.PNG.sync.read(raw),evidenceFile=pngjs.PNG.sync.read(evidence);
const rawCanvas=await canvasFrom(raw),evidenceCanvas=await canvasFrom(evidence);
record('raw file RGBA → native decode/draw/read',rawFile.data,pixels(rawCanvas));
const exact=new Uint8ClampedArray(rawFile.data);
for(let index=0;index<exact.length;index+=4){const light=Math.max(exact[index],exact[index+1],exact[index+2]);if(light<=24)exact[index+3]=0;else if(light<72)exact[index+3]=Math.round(exact[index+3]*(light-24)/48);}
record('exact24/72 before Canvas put → evidence file RGBA',exact,evidenceFile.data);
context._maskWorldDropBlack(rawCanvas);
record('mask exact array → native put/read',exact,pixels(rawCanvas));
record('evidence file RGBA → native decode/draw/read',evidenceFile.data,pixels(evidenceCanvas));
const direct=record('native masked Canvas → evidence decoded Canvas',pixels(rawCanvas),pixels(evidenceCanvas));
const copy=backend.createCanvas(256,256);copy.getContext('2d').drawImage(rawCanvas,0,0);
record('native masked Canvas → same-size Canvas draw',pixels(rawCanvas),pixels(copy));
const derived=rawCanvas.toBuffer('image/png');
fs.writeFileSync(new URL('ring_phys_native_roundtrip.png',owned),derived);
const derivedFile=pngjs.PNG.sync.read(derived),derivedCanvas=await canvasFrom(derived);
record('native masked read → native PNG encoded RGBA',pixels(rawCanvas),derivedFile.data);
const roundtrip=record('native masked Canvas → own PNG decode/draw/read',pixels(rawCanvas),pixels(derivedCanvas));
record('own native PNG file → evidence PNG file',derivedFile.data,evidenceFile.data);
const resize=canvas=>{const scaled=backend.createCanvas(34,34);scaled.getContext('2d').drawImage(canvas,0,0,34,34);return scaled;};
const small=record('34px native mask resize → evidence decode resize',pixels(resize(rawCanvas)),pixels(resize(evidenceCanvas)));
record('34px native mask resize → own PNG roundtrip resize',pixels(resize(rawCanvas)),pixels(resize(derivedCanvas)));
const rawSurface=rawCanvas.toBuffer('raw'),pngSurface=evidenceCanvas.toBuffer('raw');
record('premultiplied native BGRA surfaces mask → evidence',rawSurface,pngSurface);
const hypotheses=[];
for(const mode of ['floor','round']){
  const predicted=new Uint8ClampedArray(exact.length);
  for(let index=0;index<exact.length;index+=4){const alpha=exact[index+3];predicted[index+3]=alpha;for(let channel=0;channel<3;channel++){const premul=Math[mode](exact[index+channel]*alpha/255);predicted[index+channel]=alpha?Math.floor(premul*255/alpha):0;}}
  hypotheses.push({mode,versusNativeMask:compare(predicted,pixels(rawCanvas)),versusEvidenceDecoded:compare(predicted,pixels(evidenceCanvas))});
}
assert.equal(direct.rgbaDiff,93204);assert.equal(direct.alphaDiff,0);
assert.equal(small.rgbaDiff,1667);assert.equal(small.alphaDiff,0);
assert.equal(hypotheses[0].versusNativeMask.rgbaDiff,0);
assert.equal(hypotheses[1].versusEvidenceDecoded.rgbaDiff,0);
assert.equal(roundtrip.rgbaDiff,0);
const result={taskId:'ITEM-RING-RGB-ATTRIBUTION',backend:{canvas:backend.version,cairo:backend.cairoVersion,png:backend.pngVersion,node:process.version},inputs:{rawSha256:sha(raw),evidenceSha256:sha(evidence),maskSha256:sha(maskSource)},rows,hypotheses,derived:{file:'ring_phys_native_roundtrip.png',bytes:derived.length,sha256:sha(derived)},ownRoundtripExact:roundtrip.rgbaDiff===0,scope:'offline native Canvas and lossless PNG file decode; no Chrome/game/GPU test'};
fs.writeFileSync(new URL('rgb-stages.json',owned),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
