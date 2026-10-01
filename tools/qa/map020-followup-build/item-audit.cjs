'use strict';
// Executes extracted current functions in a VM with explicit DOM/image stubs.
// No page boot, assets decode, game changes or candidate patch installation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../../..'),acorn=require(path.join(ROOT,'node_modules/acorn'));
const checks=[],observations=[];
function check(name,good,detail){checks.push({name,status:good?'PASS':'FAIL',detail});}
function setup(file){
 const source=fs.readFileSync(path.join(ROOT,file),'utf8');
 const start=source.indexOf('const _ELKEY=');const end=source.indexOf('const STAT_SVG=',start);
 if(start<0||end<0)throw Error('Item region not found');
 const region=source.slice(start,end),ast=acorn.parse(region,{ecmaVersion:'latest'});
 const want=new Set(['_ELKEY','_ITEM_CUTOUT_BASES','_ITEM_SKIN_MISSING_ELEMENTS','_ITEM_SKIN_MISSING_VARIANTS','_itemSkinSrc','_itemSkin','_worldItemSkinCache','_worldItemSkin']);
 const chunks=[];
 for(const node of ast.body){const names=node.type==='FunctionDeclaration'?[node.id.name]:node.type==='VariableDeclaration'?node.declarations.map(d=>d.id.name):[];if(names.some(n=>want.has(n)))chunks.push(region.slice(node.start,node.end));}
 const hasCutout=region.includes('const _ITEM_CUTOUT_BASES=');
 if(chunks.length!==want.size-(hasCutout?0:1))throw Error('Unexpected item extraction count '+chunks.length);
 const images=[],maskCalls=[];
 class FakeImage{constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}set src(v){this._src=v;this.complete=false;this.naturalWidth=0;}get src(){return this._src;}succeed(){this.complete=true;this.naturalWidth=256;this.naturalHeight=256;this.onload?.();}fail(){this.complete=true;this.naturalWidth=0;this.onerror?.();}}
 const ctx=vm.createContext({Image:FakeImage,Map,Set,RARITY_C:['#aaa'],_itemIco:()=>'<svg data-fallback="stub"></svg>',document:{createElement:()=>({getContext:()=>({drawImage(){}})})},_maskWorldDropBlack:c=>{maskCalls.push(c);return c;}});
 vm.runInContext(chunks.join('\n')+'\nthis.api={_itemSkinSrc,_itemSkin,_worldItemSkin};',ctx);
 return {api:ctx.api,images,maskCalls,ctx,source,hasCutout,sha256:crypto.createHash('sha256').update(source).digest('hex')};
}
const inputs={};
for(const file of ['game.html','game-easy-test.html']){
 const p=setup(file);inputs[file]=p.sha256;
 check(file+' missing fire resolves phys',p.api._itemSkinSrc('ring','fire')==='output/imagegen/item-skins/ring_phys.png');
 check(file+' bone skips element suffix',p.api._itemSkinSrc('bone_skull','ice')==='output/imagegen/item-skins/bone_skull.png');
 const it={slot:'belt',el:2,rarity:5,uniqueId:'UI-07'},before=JSON.stringify(it);
 const html=p.api._itemSkin(it,64);
 const expectedSrc=p.hasCutout?'img/ui/item-cutouts/belt_phys_cutout.png':'output/imagegen/item-skins/belt_ice.png';
 check(file+' uniqueId currently uses common skin',html.includes('src="'+expectedSrc+'"')&&!html.includes('unique-items'),{hasCutout:p.hasCutout,expectedSrc});
 check(file+' no item data mutation',JSON.stringify(it)===before);
 const handler=html.match(/onerror="([^"]+)"/)[1];
 const mock={dataset:{fb:'output/imagegen/item-skins/belt_phys.png',el:'2'},src:'img/ui/item-cutouts/belt_phys_cutout.png',classList:{add(){}},removeAttribute(n){if(n==='data-fb')delete this.dataset.fb;},remove(){this.removed=true;}};
 vm.runInNewContext('(function(){'+handler+'}).call(image)',{image:mock});
 check(file+' DOM first failure -> physical',mock.src==='output/imagegen/item-skins/belt_phys.png'&&!mock.dataset.fb&&!mock.removed);
 vm.runInNewContext('(function(){'+handler+'}).call(image)',{image:mock});
 check(file+' DOM second failure removes image, retains SVG sibling',mock.removed&&html.includes('<svg'));
 check(file+' no Seedream/unique render integration',!p.source.includes('seedream-candidate')&&!p.source.includes('img/ui/unique-items/'));
 // Cutout successful: no mask. Failed cutout with successful physical fallback:
 // current code still branches on original cutoutSrc; report defect, do not fix game.
 const world=setup(file);world.api._worldItemSkin(it);const image=world.images[0];
 check(file+' world loading -> null',world.api._worldItemSkin(it)===null);
 image.succeed();const successful=world.api._worldItemSkin(it);
 check(file+' successful initial image alpha handling',p.hasCutout?(successful===image&&world.maskCalls.length===0):world.maskCalls.length===1,{hasCutout:p.hasCutout,maskCalls:world.maskCalls.length});
 const failed=setup(file);failed.api._worldItemSkin(it);const fi=failed.images[0];fi.fail();
 check(file+' world cutout error selects physical',fi.src==='output/imagegen/item-skins/belt_phys.png');
 fi.succeed();failed.api._worldItemSkin(it);
 observations.push({file,kind:failed.maskCalls.length===0?'REPRODUCED_DEFECT':'PASS_COMPARISON',name:'Physical fallback alpha handling',fallbackSrc:fi.src,maskCalls:failed.maskCalls.length,expectedMaskCalls:1,observedDefect:failed.maskCalls.length===0,scope:'mocked image success/error using extracted current function; real pixels not rendered'});
 check(file+' opaque physical fallback is masked',failed.maskCalls.length===1);
 const both=setup(file);both.api._worldItemSkin(it);both.images[0].fail();both.images[0].fail();
 check(file+' world both failures -> null',both.api._worldItemSkin(it)===null);
 const opaque=setup(file);opaque.api._worldItemSkin({slot:'ring1',el:2});opaque.images[0].succeed();opaque.api._worldItemSkin({slot:'ring1',el:2});
 check(file+' opaque non-cutout image masks once',opaque.maskCalls.length===1);
 const inventory=[];
 for(const [id,base] of [['UI-07','belt'],['UI-20','shield'],['UI-21','armor']]){
  const paths=[`assets/unique-items/${id.toLowerCase()}.png`,`assets/unique-items/${id.toLowerCase()}-seedream-candidate.png`,`img/ui/item-cutouts/${base}_phys_cutout.png`,`output/imagegen/item-skins/${base}_phys.png`];
  inventory.push({id,paths:paths.map(p=>{
   const full=path.join(ROOT,p),exists=fs.existsSync(full);if(!exists)return {path:p,exists};
   const fd=fs.openSync(full,'r'),header=Buffer.alloc(33);try{fs.readSync(fd,header,0,33,0);}finally{fs.closeSync(fd);}
   return {path:p,exists,png:{width:header.readUInt32BE(16),height:header.readUInt32BE(20),colorType:header[25],alpha:header[25]===4||header[25]===6}};
  })});
 }
 observations.push({file,kind:'ASSET_PRESENCE',inventory});
}
const result={kind:'source-extracted-vm-contract-audit',checks,counts:Object.fromEntries(['PASS','FAIL'].map(k=>[k,checks.filter(x=>x.status===k).length])),observations,inputs,limits:['Image loader/DOM/canvas are stubs; no actual image decode, browser, shader, audio, save or item effect test.','New unique art candidate patch is not installed or approved.','Both original and Seedream candidate sets are preserved; current 0/22 visual adoption remains unchanged.']};
console.log(JSON.stringify(result,null,2));process.exitCode=result.counts.FAIL?1:0;
