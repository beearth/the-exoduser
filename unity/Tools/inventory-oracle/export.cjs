const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1]};
const project=path.resolve(arg('--project',path.join(__dirname,'../..')));
const root=path.resolve(arg('--source-root',path.join(project,'..')));
const dependency=path.resolve(arg('--dependency-root',root));
const acorn=require(require.resolve('acorn',{paths:[dependency]}));
const source=fs.readFileSync(root+'/godot/source_snapshot/game.html','utf8');
const sha=crypto.createHash('sha256').update(source).digest('hex');
if(sha!=='dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209')throw Error('source pin changed');
const seed=0x20261024;let state=seed,draws=0;
const math=Object.create(Math);math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;draws++;return state/4294967296;};
class Clock extends Date {static now(){return 1792796400000}}
const ctx=vm.createContext({Math:math,Date:Clock,performance:{now:()=>100},console});
const run=s=>vm.runInContext(s,ctx,{timeout:5000});
const anchors=[];
function exp(name){const m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);if(!m)throw Error('missing expression '+name);const n=acorn.parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});const text=source.slice(n.start,n.end);run('var '+name+'=('+text+');');anchors.push({name,line:source.slice(0,m.index).split('\n').length});}
function fun(name){const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);if(!m)throw Error('missing function '+name);const n=acorn.parseExpressionAt(source,m.index,{ecmaVersion:'latest'});run(source.slice(n.start,n.end));anchors.push({name,line:source.slice(0,m.index).split('\n').length});}
run('var window=globalThis,OPT={diff:5},G={stage:0,on:true},INV={equipped:{}},STATS={str:0,dex:0,int:0,vit:0,lck:0},PASSIVES=new Proxy({},{get:(o,k)=>o[k]||0}),_grit=0,_eqAffixCache=null,_eqStatCache=null,_lEqCache=null;');
for(const n of ['EL','RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','WTYPES','WTYPE_KEYS','_WP_MOD','BOWTYPES','BTYPE_KEYS','IMPLICIT_TABLE','_AFSLOT','AFFIX_POOL','_diffSigned'])exp(n);
// Declared source demo flag changes affix pool filtering; white starter affixes are
// zero-count in either mode. Preserve full mode, same admitted snapshot formulas.
run('var _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();');
for(const n of ['mkP','_weaponName','rollAffixes','mkItem','defaultItems','wp','sh','bt','ar','hm','bw','gl','pt','blt','nc','rg1','rg2','cp','_uEq','_lEqRebuild','_lEq','_lvB','_eqAffixRebuild','_eqAffix','_eqStatRebuild','_eqStat','_eqImplicit','_gritTotal','_gritHpFlat','_gritStFlat','_gritMpFlat','pPredSpd','recalcSt','applyStats','statDex','statCrit','statCritDmg','_eqLckTotal','_passDmgSum','pAtkMul','statDropBonus'])fun(n);
run('var P=mkP();var gear=defaultItems();for(var it of gear)INV.equipped[it.slot]=it;applyStats();P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;');
if(draws!==505)throw Error('Original starter RNG continuation drift');
for(const n of ['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS'])exp(n);
run(`INV.bag=[];var BAG_MAX=300;function notify(){}function _T(x){return x}function _L(x){return x}function playEquipSfx(){}function dbSaveForce(){}function playFM(){}function playNoise(){}function addTxt(){};`);
for(const n of ['_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','itemPower','_invSortBag','_invAutoPlace','_invCanPlace','_earringSlot','_equipSlot','_refreshEquipmentStats','equipItem','unequipItem'])fun(n);
run(`var _earringEquipTarget=null;const _se=[EL.F,EL.I,EL.D,EL.L],_sw=['dagger','hammer','axe','spear'];for(let bi=0;bi<4;bi++)INV.bag.push(mkItem('weapon',0,_se[bi],1,_sw[bi]));INV.bag.push(mkItem('armor',0,EL.F,1));INV.bag.push(mkItem('shield',0,EL.I,1));INV.bag.push(mkItem('helmet',0,EL.D,1));INV.bag.push(mkItem('boots',0,EL.L,1));INV.bag.push(mkItem('cape',0,EL.F,1));INV.bag.push(mkItem('bow',0,EL.F,1,'crossbow'));_invAutoPlace();`);
const starting=run('JSON.parse(JSON.stringify({equipped:SLOT_NAMES.map(s=>INV.equipped[s]||null),bag:INV.bag}))');
const bagDraws=draws;
const stats=()=>run(`(${derivedExpression()})`);
function derivedExpression(){return `({PlayerMaxHp:P.mhp,PlayerBaseAttack:P.baseAtk,PlayerSpeed:P.speed,PlayerMaxStamina:P.mst,PlayerMaxMana:P.mmp,PlayerMaxShield:P.mshield,PlayerHpRegen:P.hpR,PlayerStaminaRegen:P.stR,PlayerManaRegen:P.mpR,PlayerPhysicalDefense:P.baseDef+(sh().def||0)+(ar().def||0)+(bt().def||0)+(gl().def||0)+(pt().def||0),PlayerCriticalChance:statCrit(),PlayerCriticalMultiplier:statCritDmg(),AttackSpeedMultiplier:statDex(),DamageMultiplier:pAtkMul(),AccessoryDamageBonus:((nc().dmgBonus||0)+(rg1().dmgBonus||0)+(rg2().dmgBonus||0)+(blt().dmgBonus||0)+((INV.equipped.bracelet||{}).dmgBonus||0)+((INV.equipped.headband||{}).dmgBonus||0)+((INV.equipped.headband2||{}).dmgBonus||0))*.01,DropBonus:statDropBonus(),StrengthFlat:STATS.str+_eqStat('Str')+_lvB(),WeaponAttack:+wp().atk||0,WeaponSpeed:+wp().spd||0,WeaponRange:(+wp().wRange||0)+(+wp().bonusRange||0)*4,WeaponArc:+wp().wArcW||0,hp:P.hp,st:P.st,mp:P.mp,shield:P.shield})`;}
const reset=()=>run(`INV={equipped:{},bag:JSON.parse(${JSON.stringify(JSON.stringify(starting.bag))})};var _eq=JSON.parse(${JSON.stringify(JSON.stringify(starting.equipped))});SLOT_NAMES.forEach((s,i)=>INV.equipped[s]=_eq[i]);P=mkP();G.stage=0;STATS={str:0,dex:0,int:0,lck:0};_eqStatCache=null;_eqAffixCache=null;_lEqCache=null;applyStats();P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;`);
const cases=[];
for(let i=0;i<starting.bag.length;i++){reset();run(`var target=INV.bag[${i}];equipItem(target)`);cases.push({name:'equip-'+starting.bag[i].name,index:i,stats:stats(),equipped:run('SLOT_NAMES.map(s=>INV.equipped[s]?.name||null)'),bag:run('INV.bag.map(i=>({name:i.name,x:i._gx,y:i._gy}))')});}
for(const slot of run('SLOT_NAMES')){reset();run(`unequipItem(${JSON.stringify(slot)})`);cases.push({name:'unequip-'+slot,slot,stats:stats(),equipped:run('SLOT_NAMES.map(s=>INV.equipped[s]?.name||null)'),bag:run('INV.bag.map(i=>({name:i.name,x:i._gx,y:i._gy}))')});}
reset();const initialStats=stats(),power=run('INV.bag.map(i=>itemPower(i))');
const profiles=[];for(const level of [1,2,100])for(const difficulty of [0,5,-5]){reset();run(`P.lv=${level};G.stage=5;OPT.diff=${difficulty+5};applyStats()`);profiles.push({level,stage:5,difficulty,stats:stats()});}run('OPT.diff=5');reset();
const grid=[];for(const [x,y] of [[-1,0],[9,0],[0,119],[2,0],[1,5],[8,118]])grid.push({x,y,allowed:run(`_invCanPlace(0,${x},${y})`)});
run('P.hp=50;P.st=25;P.mp=30;P.shield=20;equipItem(INV.bag.find(i=>i.slot===\'armor\'))');const noHeal=stats();
const compared=anchors.map(a=>({...a,equals_live:null}));const livePath=arg('--live-source',null);
if(livePath){const live=fs.readFileSync(livePath,'utf8');for(const a of compared){const re=new RegExp('function\\s+'+a.name+'\\s*\\(');const m=re.exec(source),l=re.exec(live);if(m&&l){const x=acorn.parseExpressionAt(source,m.index,{ecmaVersion:'latest'}),y=acorn.parseExpressionAt(live,l.index,{ecmaVersion:'latest'});a.equals_live=source.slice(x.start,x.end)===live.slice(y.start,y.end);}else{const e=new RegExp('(?:const|let|var)\\s+'+a.name+'\\s*=');const x=e.exec(source),y=e.exec(live);if(x&&y){const sx=acorn.parseExpressionAt(source,x.index+x[0].length,{ecmaVersion:'latest'}),ly=acorn.parseExpressionAt(live,y.index+y[0].length,{ecmaVersion:'latest'});a.equals_live=source.slice(sx.start,sx.end)===live.slice(ly.start,ly.end);}}}if(compared.some(x=>x.equals_live===false))throw Error('Live original function or table drift');}
const out={schema:'exoduser.unity.inventory-source-oracle.v1',source:{sha256:sha,seed,starterDrawCount:505,drawCountAfterBag:bagDraws,anchors:compared},starting,initialStats,power,cases,profiles,grid,noHeal,scope:{native_runtime_javascript:false,full_browser_rng_replay:false,starter_common_equipped_magic_bag:true,conditional_affix_combat:false,persistence:false}};
fs.writeFileSync(path.join(__dirname,'oracle.json'),JSON.stringify(out,null,2));
fs.writeFileSync(path.join(__dirname,'inventory-seed.json'),JSON.stringify(starting,null,2));
console.log(JSON.stringify({equipped:starting.equipped.filter(Boolean).length,bag:starting.bag.length,cases:cases.length,draws,keys:[...new Set([...starting.equipped,...starting.bag].filter(Boolean).flatMap(Object.keys))],implicits:[...new Set([...starting.equipped,...starting.bag].filter(Boolean).map(i=>i._implicitStat))]}));
