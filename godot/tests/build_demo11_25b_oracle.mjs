// Extract and execute only original auto-HP phase. UTF-8 file oracle, no console JSON.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const args = Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(2,i),x.slice(i+1)];}));
if (!args['source-game'] || !args.output) throw Error('--source-game= and --output= required');
const bytes=fs.readFileSync(args['source-game']), lines=bytes.toString('utf8').split('\n');
const start=lines.findIndex(x=>x.trim()==='if(autoPotCd>0)autoPotCd-=sp;');
const end=lines.findIndex((x,i)=>i>start && x.includes('if(G._pStats)G._pStats._hC++'));
if(start!==35892 || end!==35909) throw Error('Original auto-HP source span changed; audit required');
const source=lines.slice(start,end+2).join('\n');
const rows=[];
for(const cd of [-1,0,.5,1,420]) for(const hp of [0,50,200,249,250,251,350]) for(const mats of [0,1]) for(const lesson of [false,true]) for(const level of [0,1,2]) {
 const i=rows.length, input={cd,hp,mhp:350,mats,lesson,level,level2:i%5===0?1:level,power:0,power2:i%7===0?.5:0,sp:[.35,1,6][i%3],gl:[{}, {potCd:'0.2'},{potCd:-.1},{potCd:.8}][i%4],belt:i%2?{potCd:.2}:{},regen:[0,10,-2][i%3]};
 const reads=[];let calls=0;
 const p={hp,mhp:350,x:0,y:0},g={mats,_pStats:{_hC:2},_sStats:{potions:3}};
 const c={P:p,G:g,autoPotCd:cd,sp:input.sp,window:{_parryLesson:{active:lesson}},
  potHeal:()=>{reads.push('level');const lv=calls++===0?level:input.level2;return lv<=0?100:lv===1?150:lv*100;},
  _eqAffix:()=>{reads.push('affix');return calls===1?input.power:input.power2;},
  gl:()=>{reads.push('gloves');return input.gl;},blt:()=>{reads.push('belt');return input.belt;},
  PASSIVES:new Proxy({pRegen:input.regen},{get:(o,k)=>{reads.push('regen');return o[k];}}),
  SFX:{potion(){}},_lEq:()=>0,addTxt(){},_T:x=>x};
 vm.runInNewContext(source,c,{timeout:1000});
 rows.push({input,expected:{hp:p.hp,mats:g.mats,cd:c.autoPotCd,reads,hC:g._pStats._hC,potions:g._sStats.potions}});
}
fs.writeFileSync(args.output,JSON.stringify({source:{start:start+1,end:end+2,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},rows}),'utf8');
console.log(`DEMO11_25B_ORACLE cases=${rows.length} lines=${start+1}-${end+2}`);
