import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const arg=n=>process.argv.find(x=>x.startsWith(n+'='))?.slice(n.length+1);
const src=fs.readFileSync(arg('--source-game'),'utf8');
const section=(a,b)=>{const start=src.indexOf(a),end=src.indexOf(b,start+a.length);if(start<0||end<0)throw Error('missing source '+a);return src.slice(start,end)};
const parts=[section('const ITEM_SIZE=','const SLOT_KR='),section('function _invRows(){','// 가방 정렬 순서'),section('function _earringSlot(slot)','let _dropItemLast='),section('const _MALICE_COST_MUL=','function enhCostRaw('),section('function xferCost(n)','function enhColor('),src.split('\n').find(l=>l.startsWith('function _itemEconomyRarity('))];
const code=parts.join('\n');
const cases=JSON.parse(fs.readFileSync(arg('--cases-file'),'utf8'));
const rows=cases.map(c=>{const context=vm.createContext({input:c});vm.runInContext(`let INV,G,P,CRYSTAL_BAG;const CRYSTAL_BAG_MAX=9999;let BAG_MAX=300;let refreshCalls=0;let _eqAffixCache={},_eqStatCache={},_lEqCache={};const window={};const CRYSTAL_DEFS={};const _T=s=>s,_L=(a,b)=>a;const notify=()=>{},playEquipSfx=()=>{},addTxt=()=>{},playFM=()=>{},playNoise=()=>{},dbSaveForce=()=>{};const applyStats=()=>{refreshCalls++};
`+code+`
const c=JSON.parse(JSON.stringify(input));INV=c.inv;G={mats:c.mats};P=c.p;CRYSTAL_BAG=c.gems;let error=null;try{if(c.op==='equip'){const it=INV.bag[c.index];_earringEquipTarget=c.target||null;try{equipItem(it)}finally{_earringEquipTarget=null}}else{unequipItem(c.slot)}}catch(e){error=String(e)};globalThis.result={inv:INV,mats:G.mats,gems:CRYSTAL_BAG,refresh_calls:refreshCalls,error};`,context,{timeout:1000});return context.result;});
// Both packets are parsed by the same JS Number implementation. No tolerance,
// ignored keys or ID normalization: Godot's second JSON float parse is excluded.
const actual=JSON.parse(fs.readFileSync(arg('--observations-file'),'utf8'));
function mismatch(a,b,path=''){
 if(typeof a!==typeof b || Array.isArray(a)!==Array.isArray(b))return path+':type';
 if(a===null||b===null||typeof a!=='object')return a===b?'':path+':value';
 const ak=Object.keys(a),bk=Object.keys(b);
 if(ak.length!==bk.length)return path+':key-count';
 for(const k of ak){if(!Object.hasOwn(b,k))return path+'/'+k+':missing';const d=mismatch(a[k],b[k],path+'/'+k);if(d)return d;}
 return '';
}
if(actual.length!==rows.length)throw Error('observation row count');
const comparisons=rows.map((r,i)=>Object.fromEntries(['inv','mats','gems','refresh_calls'].map(k=>{const d=mismatch(r[k],actual[i][k]);return[k,{equal:d==='',mismatch:d}]})));
fs.writeFileSync(arg('--out-file'),JSON.stringify({rows,comparisons,source_sha256:crypto.createHash('sha256').update(src).digest('hex'),slice_sha256:crypto.createHash('sha256').update(code).digest('hex'),source:'G15286 / G15830-15834 / G16180-16210 / G16272-16380 / G28080-28106 / G28186'}));
