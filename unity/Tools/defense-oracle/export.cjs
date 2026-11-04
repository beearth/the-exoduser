// D-U2: runs the ORIGINAL web _playerDefTotals() and the defence block of hurtP (dtype .. minimum damage) of a pinned main game.html
// over seeded equipment / level / grit / pArmor cases and hurt scenarios. Unity admits only unenhanced, crystal-less items, so enh and crystals stay 0.
// usage: node export.cjs --source <game.html> --out <oracle.json>
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function arg(k){const i=process.argv.indexOf(k);if(i<0||!process.argv[i+1])throw Error('Pass '+k);return process.argv[i+1];}
const source=fs.readFileSync(arg('--source'),'utf8'),lineOf=i=>source.slice(0,i).split('\n').length,pulled=[];
function fn(name){const i=source.indexOf('\nfunction '+name+'(');if(i<0)throw Error(name+' not found');let d=0,j=source.indexOf('{',i);for(;j<source.length;j++){if(source[j]==='{')d++;else if(source[j]==='}'&&--d===0)break;}pulled.push(name+'@'+lineOf(i+1));return source.slice(i+1,j+1);}
function exact(text){const i=source.indexOf(text);if(i<0||source.indexOf(text,i+1)>=0)throw Error('not unique: '+text);pulled.push(text.slice(0,40)+'@'+lineOf(i));return text;}
const segA="  const dtype=(opts&&opts.dtype)||'phys';",segB='  if(a<_minDmg)a=_minDmg;',ia=source.indexOf(segA),ib=source.indexOf(segB,ia);
if(ia<0||ib<0||ib-ia>4000)throw Error('hurtP defence block not found');pulled.push('hurtP defence block@'+lineOf(ia)+'-'+lineOf(ib));
const drCap=/^const DR_CAP=([0-9.]+);/m.exec(source);if(!drCap)throw Error('DR_CAP missing');
const code=['var _eqStatCache=null,_eqAffixCache=null,_eqAffixVer=0;',/^const SLOT_NAMES=\[.*\];$/m.exec(source)[0],'const DR_CAP='+drCap[1]+';',
 fn('sh'),fn('ar'),fn('cp'),fn('enhMul'),fn('pDefAdd'),fn('_lvB'),fn('_gritTotal'),fn('_eqStatRebuild'),fn('_eqStat'),fn('_eqAffixRebuild'),fn('_eqAffix'),fn('_playerDefTotals'),
 'function __baseDef(){P.baseDef=2;const _cr={def:0};'+exact("P.baseDef+=~~_cr.def+_eqAffix('defFlat')+~~(_gritTotal()*.5);")+'const _aLv=PASSIVES.pArmor||0;'+exact('if(_aLv>0){P.baseDef+=_aLv*20}')+'}',
 'function __hurtDef(dmg,opts){'+source.slice(ia,ib+segB.length)+'\nreturn a;}'].join('\n');
const ctx=vm.createContext({INV:{equipped:{}},P:{},PASSIVES:{},_grit:0,_T:s=>s,addTxt:()=>{},Math});vm.runInContext(code,ctx);
let seed=0x0d52;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
// affix ids and their source slots (AFFIX_POOL); value = one of the tiers
const AFF={defFlat:[[10,20,30,40,50],['armor','shield','gloves','pants','boots','cape']],eDefFlat:[[25,50,100,150,220],['necklace','ring1','belt','headband','bracelet']],
 gritFlatN:[[20,40,60,80,100],['necklace']],gritFlatR:[[10,20,30,40,50],['ring1','ring2','bracelet','belt','headband']],physDR:[[.04,.06,.1,.16,.22],['armor','shield']],
 barrier:[[8,15,28,45,65],['armor']],healthyDef:[[5,10,18,28,40],['armor','shield']],injuredDR:[[.06,.1,.16,.24,.34],['armor','shield']],dotDR:[[.06,.1,.16,.24,.34],['pants','cape']],
 bossDR:[[.05,.08,.14,.22,.3],['armor','shield']],closeDR:[[.05,.08,.14,.22,.3],['armor']],farDR:[[.05,.08,.14,.22,.3],['shield','cape']]};
const SLOTS=['weapon','shield','boots','armor','helmet','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];
const cases=[];
for(let c=0;c<240;c++){
  const items=[];const n=c<4?[0,3,8,14][c]:1+Math.floor(rnd()*SLOTS.length);const slots=SLOTS.slice().sort(()=>rnd()-.5).slice(0,n);
  for(const slot of slots){const it={slot,def:rnd()<.6?Math.floor(rnd()*60):0,eDef:rnd()<.5?Math.floor(rnd()*80):0,bGrit:rnd()<.2?Math.floor(rnd()*30):0,affixes:[]};
    for(const id in AFF)if(AFF[id][1].includes(slot)&&rnd()<.35){const t=Math.floor(rnd()*5);it.affixes.push({id,value:AFF[id][0][t],tier:t});}
    items.push(it);}
  const level=pick([1,2,7,20,45,99]),grit=c%3===0?Math.floor(rnd()*40):0,pArmor=c%5===0?Math.floor(rnd()*4):0;
  ctx.INV.equipped={};for(const it of items)ctx.INV.equipped[it.slot]=JSON.parse(JSON.stringify(it));ctx._eqStatCache=null;ctx._eqAffixCache=null;
  ctx.P={lv:level,s:'idle',iframes:0};ctx._grit=grit;ctx.PASSIVES={pArmor};vm.runInContext('__baseDef()',ctx);
  const tot=vm.runInContext('_playerDefTotals()',ctx),mhp=pick([300,800,2400]),hurts=[];
  for(const dmg of [5,60,400,5000])for(const kind of ['phys','magic','dot','label'])for(const hpf of [1,.5,.2]){
    const near=rnd()<.25,x=near?Math.floor(rnd()*60):400+Math.floor(rnd()*6000),y=near?Math.floor(rnd()*50):300+Math.floor(rnd()*6000);
    const opts=kind==='magic'?{dtype:'magic'}:kind==='dot'?{dot:true}:kind==='label'?{dot:true,src:'중독'}:undefined;
    Object.assign(ctx.P,{hp:Math.floor(mhp*hpf),mhp,x,y,iframes:0});
    hurts.push({dmg,kind,hp:ctx.P.hp,x,y,web:vm.runInContext('__hurtDef(__d,__o)',Object.assign(ctx,{__d:dmg,__o:opts}))});}
  cases.push({level,grit,pArmor,mhp,items,pDef:tot.pDef,eDef:tot.eDef,hurts});
}
fs.writeFileSync(arg('--out'),JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),pulled,cases}));
console.log('DEFENSE_ORACLE '+cases.length+' cases / '+cases.reduce((s,c)=>s+c.hurts.length,0)+' hurts from '+pulled.join(', '));
