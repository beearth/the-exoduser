import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const args=Object.fromEntries(process.argv.slice(2).map(v=>{const n=v.indexOf('=');return [v.slice(2,n),v.slice(n+1)];}));
if(!args['source-game']||!args.output||!args['constructor-output'])throw Error('require --source-game= --output= --constructor-output= [--acorn-root=repository]');
const require=createRequire(path.join(path.resolve(args['acorn-root']||'.'),'package.json'));
const acorn=require('acorn');
const html=fs.readFileSync(args['source-game'],'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)];
const match=scripts.find(m=>m[1].includes('function mkEn('));
if(!match)throw Error('original mkEn script absent');
const js=match[1],start=match.index+match[0].indexOf(js);
const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'script'});
const records=[];
function original(name){
 for(const node of ast.body){
  if(node.type==='FunctionDeclaration'&&node.id?.name===name)return record(name,node,js.slice(node.start,node.end));
  if(node.type==='VariableDeclaration')for(const d of node.declarations)if(d.id.type==='Identifier'&&d.id.name===name)return record(name,d,`${node.kind} ${js.slice(d.start,d.end)};`);
 }
 throw Error(`original binding absent: ${name}`);
}
function record(name,node,text){records.push({name,from:html.slice(0,start+node.start).split('\n').length,to:html.slice(0,start+node.end).split('\n').length,sha256:crypto.createHash('sha256').update(text).digest('hex')});return text;}
const definitions=['CHAPTER_STAGES','ELITE_TIERS','ELITE_PROB','MOD_DEFS','AURA_DEFS','rollElite','rollMods','rollAura','_tickEliteAttackLock','_claimEliteAttack','DIFF_MUL','DIFF_LV_OFF','ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_SPD','ETYPE_R','ETYPE_POISE','ETYPE_COL','ETYPE_ERES','_CH1_OPENING_EXCLUDED_ET','isRareEtype','_enemyHpPacing','_MOB8_TOTAL','_MOB8_COLS','_assignMobSkin','mkEn'].map(original).join('\n');
const post=html.split('\n')[40789].trim();if(!post.startsWith('ne.hp=~~(ne.hp*.5);ne.mhp=ne.hp;ne.eShield=0;ne.eShieldMax=0;'))throw Error('source child postassignment moved');
const sandbox={};sandbox.window=sandbox;vm.createContext(sandbox);
vm.runInContext(`const SI_TO_HELL=new Uint8Array(35);for(const c of ${original('CHAPTER_STAGES').replace(/^const CHAPTER_STAGES=/,'').replace(/;$/,'')})for(let f=0;f<c.stages;f++)SI_TO_HELL[c.startSi+f]=c.hell;
const STG=[];const ELC=[];const _useGPU=false,_useGL=false,_ESPRITES={};
let OPT={diff:5},P={lv:1},G={stage:0,_stageDiffOff:0};
let stream=[],cursor=0;Math.random=()=>{if(cursor>=stream.length)throw Error('oracle stream exhausted');return stream[cursor++];};
let moveTo=null;function canMv(){return moveTo===null}function safePt(){return moveTo}
${definitions}
function units(v){stream=v.slice();cursor=0}
function selection(kind,tier,stage,draws){units(draws);let value=kind==='elite'?rollElite(stage):kind==='mods'?rollMods(tier,stage):rollAura(tier,stage);return {kind,tier,stage,draws,value,rng_count:cursor}}
function construct(c){units(c.draws);OPT.diff=c.context.difficulty;P.lv=c.context.player_level;G._stageDiffOff=c.context.stage_difficulty_offset;moveTo=c.moveTo;let e=mkEn(c.x,c.y,0,3,false,c.el,c.context.room);let result={factory_hp:e.hp};${html.split('\n')[40789].trim()}
for(const k of ['hp','mhp','atk','baseAtk','r','speed','st2','facing','projT','elite','mods','aura','poise','maxPoise','eShield','eShieldMax','_bossOrbitAng','_erraticAng','_homeX','_homeY'])result[k]=e[k];return {...c,result,rng_count:cursor}}
`.replace(html.split('\n')[40789].trim(),html.split('\n')[40789].trim().replaceAll('ne.','e.')),sandbox);
// STG/ELC/GPU objects are fixture services, not replacement formulas. For type3,
// STG-dependent _plvMul and color do not affect the compared projection. No HP authority stub.
const cases=[];const seqs=[[0,0,0],[.499999999999,.5,.999999999999],[.5,.5,.5],[.999999999999,.999999999999,.999999999999],[0,.999999999999,.5],[.999999999999,0,0]];
for(let stage=0;stage<4;stage++){
 for(const u of [0,.0001,.029999999999,.03,.030000000001,.5,.999999999999])cases.push(vm.runInContext(`selection('elite',0,${stage},${JSON.stringify([u])})`,sandbox));
 for(let tier=0;tier<4;tier++)for(const draws of seqs)for(const kind of ['mods','aura'])cases.push(vm.runInContext(`selection('${kind}',${tier},${stage},${JSON.stringify(draws)})`,sandbox));
}
const constructors=[];
for(const level of [1,100,501,999])for(const diff of [0,5,10])for(const mode of ['normal','M29','M30'])for(const safe of [false,true]){
 const draws=[mode==='normal'?.03:0,...(mode==='normal'?[]:[mode==='M29'?0:.5]),.13,.27,.41,.59,.61,.73,.83,.97];
 const c={name:`type3-${level}-${diff}-${mode}-${safe}`,x:127.25,y:316.75,el:2,moveTo:safe?{x:293.5,y:82.25}:null,context:{stage:0,room:-1,player_level:level,difficulty:diff,stage_difficulty_offset:0},draws};
 constructors.push(vm.runInContext(`construct(${JSON.stringify(c)})`,sandbox));
}
const gate=html.match(/gg\.hp=~~\(gg\.mhp\*4\);[\s\S]*?gg\.dropTier=Math\.min\(4,SI_TO_HELL\[si\]\+2\);/)?.[0];
const escort=html.match(/_esc\.elite=1;_esc\.hp=~~\(_esc\.mhp\*2\.5\);_esc\.mhp=_esc\.hp;/)?.[0];
if(!gate||!escort)throw Error('forced source boundary changed');
vm.runInContext(`function forced(raw,role){let si=0;if(role==='gate_guard'){let gg=raw;${gate}}else{let _esc=raw;${escort}}return raw}`,sandbox);
const forced=[];
for(const role of ['gate_guard','escort'])for(const mhp of [-9.7,0,1.9,52.3,4294967299,1e30]){const raw={mhp,hp:7,atk:13.7,baseAtk:99,r:12.9,poise:88,maxPoise:99,eShield:33,eShieldMax:44,elite:0,mods:['M30'],aura:null};const result=vm.runInContext(`forced(${JSON.stringify(raw)},'${role}')`,sandbox);forced.push({role,raw,result});}
const sourceLines=html.split('\n');
const attack=sourceLines.find(l=>l.includes("if(e.mods.includes('M29')&&e.s==='idle'"));
const ring=sourceLines.find(l=>l.includes("if(e.mods.includes('M30')&&d<800)"));
const zones=sourceLines.find(l=>l.includes('if(e._eliteZones&&e._eliteZones.length){for(let zi='));
if(!attack||!ring||!zones)throw Error('modifier boundaries changed');
vm.runInContext(`let d=0,sp=1;let damage=[];function dst(x,y,a,b){return Math.hypot(x-a,y-b)}function hurtP(n,opts){damage.push([n,opts.dtype])}function addTxt(){}function addParts(){}function playVFXAng(){}
function phase(c){let e=structuredClone(c.raw);d=c.distance;sp=c.ticks;P={x:Math.fround(d),y:0,iframes:0,s:'idle'};damage=[];_tickEliteAttackLock(e,sp);${attack}\n${ring}\n${zones};return {raw:e,damage}}`,Object.assign(sandbox,{structuredClone}));
const phases=[];
for(const mods of [['M29'],['M30'],['M29','M30']])for(const distance of [140,140.001,519.999,520,799.999,800])for(const busy of [0,1,2])for(const ticks of [.5,1,2]){
 const raw={x:0,y:0,r:14,s:'idle',st2:0,atk:40,mods,modT:{eliteBusy:busy,eliteCharge:539,eliteRing:479}};const c={raw,distance,ticks};phases.push({...c,result:vm.runInContext(`phase(${JSON.stringify(c)})`,sandbox)});
}
const source={sha256:crypto.createHash('sha256').update(html).digest('hex'),bindings:records,forced_ranges:[31620,31636],modifier_ranges:[38798,38809],constructor_post:40790,fixture_services:['collision/safePt','STG unused _plvMul projection','ELC unused color','GPU disabled']};
const out={source,catalog:vm.runInContext('({tiers:ELITE_TIERS,mods:MOD_DEFS.filter(m=>m.hell===0),auras:AURA_DEFS.filter(a=>a.hell===0)})',sandbox),cases,constructors,forced,phases};
fs.mkdirSync(path.dirname(path.resolve(args.output)),{recursive:true});fs.writeFileSync(args.output,JSON.stringify(out),'utf8');fs.writeFileSync(args['constructor-output'],JSON.stringify({source,cases:constructors}),'utf8');
process.stdout.write(JSON.stringify({selection_cases:cases.length,constructor_cases:constructors.length,forced_cases:forced.length,phase_cases:phases.length,source_sha256:source.sha256})+'\n');
