import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {createCanvas,loadImage} from 'canvas';

const root=new URL('../../../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const html=read('game.html').toString();
function extract(name){
  const anchor=`function ${name}(`,start=html.indexOf(anchor);
  assert.ok(start>=0);
  assert.equal(html.indexOf(anchor,start+anchor.length),-1);
  return html.slice(start,parseExpressionAt(html,start,{ecmaVersion:'latest'}).end);
}
const context=vm.createContext({window:{}});
vm.runInContext(read('tools/team-followup-20261001/ITEM/ring-png-candidate.js').toString(),context);
const original=extract('_worldItemSkin');
assert.equal(hash(original),'41cf68ff6b4b0ccefe690c9024191bb3a52f5178ad5896c4783c3a31edf03bf3','function contract drift');
const candidate=context.window.__ringPngDiagnostic.candidateSource(original);
assert.equal(hash(extract('_maskWorldDropBlack')),'1a8a563ba924b94577e1c53164c373ffadc371c039ed6ab93ff37bb853ab226f','mask contract drift');
assert.notEqual(candidate,original);
assert.equal(original.split('\n').filter((line,index)=>line!==candidate.split('\n')[index]).length,1);
assert.match(original,/img.src===img._worldDropCutoutSrc/);
const png=read('docs/0마스터플랜/mac-resume-20261001/ring-png-evidence/ring_phys_masked.png');
assert.equal(hash(png),'812b47358d293d3dc2c154ab5989470add22eb3f1bb7f2edf9f78cde16da0a96');
const raw=read('output/imagegen/item-skins/ring_phys.png');
assert.equal(hash(raw),'2f3a05692db24dbd36562681921ac72613fd97e44c3210083a4324805355137e');
const [rawImage,pngImage]=await Promise.all([loadImage(raw),loadImage(png)]);
assert.equal(pngImage.width,256);assert.equal(pngImage.height,256);
vm.runInContext(extract('_maskWorldDropBlack'),context);
const reference=createCanvas(256,256);
reference.getContext('2d').drawImage(rawImage,0,0);
context._maskWorldDropBlack(reference);
const decoded=createCanvas(256,256);
decoded.getContext('2d').drawImage(pngImage,0,0);
const compare=size=>{
  const arrays=[reference,decoded].map(image=>{
    const canvas=createCanvas(size,size);
    canvas.getContext('2d').drawImage(image,0,0,size,size);
    return canvas.getContext('2d').getImageData(0,0,size,size).data;
  });
  let rgbaDiff=0,alphaDiff=0,maxDelta=0,transparent=0,partial=0;
  for(let index=0;index<arrays[0].length;index++){
    const delta=Math.abs(arrays[0][index]-arrays[1][index]);
    if(delta){rgbaDiff++;if(index%4===3)alphaDiff++;maxDelta=Math.max(maxDelta,delta);}
    if(index%4===3){if(arrays[1][index]===0)transparent++;else if(arrays[1][index]<255)partial++;}
  }
  return {size,rgbaDiff,alphaDiff,maxDelta,transparent,partial};
};
const pixels=[compare(256),compare(34)];
assert.ok(pixels[0].transparent>0);assert.ok(pixels[0].partial>0);
assert.equal(pixels[0].alphaDiff,0);
const head=read('.git/HEAD').toString().trim();
const headSha=head.startsWith('ref: ')?read('.git/'+head.slice(5)).toString().trim():head;
assert.ok(headSha.startsWith('fe85bb08'),'assigned HEAD changed; reacquire before integration');
console.log(JSON.stringify({headSha,productionModified:false,functionLine:html.slice(0,html.indexOf('function _worldItemSkin(')).split('\n').length,functionSha256:hash(original),candidateSha256:hash(candidate),maskSha256:hash(extract('_maskWorldDropBlack')),gameSha256:hash(read('game.html')),easySha256:hash(read('game-easy-test.html')),rawSha256:hash(raw),pngSha256:hash(png),pngBytes:png.length,runtimeAssetPresent:fs.existsSync(new URL('img/ui/item-cutouts/ring_phys_masked.png',root)),pixels,scope:'native Canvas offline decode, not browser/GPU proof'},null,2));
