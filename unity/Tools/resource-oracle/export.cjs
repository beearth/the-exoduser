// D-U3. 웹 수식을 재작성하지 않고 원문 함수 전체를 VM에서 실행한다.
// node export.cjs --source game.html --out oracle.json --web-commit SHA --core-commit SHA --dependency-root REPO
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function arg(k){const n=process.argv.indexOf(k);if(n<0||!process.argv[n+1])throw Error(k+' 필요');return process.argv[n+1];}
const source=fs.readFileSync(arg('--source'),'utf8');
const acorn=require(require.resolve('acorn',{paths:[path.resolve(arg('--dependency-root'))]}));
const anchors=[],code=[];
function pull(name,expression=false){
  const re=new RegExp(expression?'^(?:const|let|var) '+name+'\\s*=':'^function '+name+'\\s*\\(','m'),m=re.exec(source);
  if(!m)throw Error('원문 누락: '+name);
  const node=acorn.parseExpressionAt(source,m.index+(expression?m[0].length:0),{ecmaVersion:'latest'});
  const text=source.slice(node.start,node.end);
  anchors.push({name,line:source.slice(0,m.index).split('\n').length,text});
  code.push(expression?'var '+name+'=('+text+');':text);
}
for(const n of ['SLOT_NAMES','_AFSLOT','AFFIX_POOL','_diffSigned'])pull(n,true);
for(const n of ['_lvB','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','pPredSpd','recalcSt','applyStats'])pull(n);
const ctx=vm.createContext({Math});
vm.runInContext('var P={},G={},OPT={},STATS={},PASSIVES={},INV={equipped:{}},_grit=0,_eqStatCache=null,_eqAffixCache=null,_lEqCache=null;\n'+code.join('\n'),ctx,{timeout:5000});
const run=s=>vm.runInContext(s,ctx,{timeout:5000});
const slots=Array.from(run('SLOT_NAMES')).filter(s=>s!=='ossuary');
const pool=JSON.parse(JSON.stringify(run('AFFIX_POOL'))),slotMap=JSON.parse(JSON.stringify(run('_AFSLOT')));
// 최대치뿐 아니라 회복·흡수·획득·소모·보호막 관련 항도 모두 단독 대조한다.
// 이 중 최대치에서 양쪽 모두 0인 항은 누락으로 오판하지 않고 별도로 표시한다.
const resource=a=>/hp|life|mana|shield|grit|stamina|heal|regen|leech|revive|potion|potCd/i.test(a.id)||/MP|ST|[Mm]p(?=[A-Z]|$)|[Ss]t(?=[A-Z]|$)/.test(a.id)||/^(strFlat|dexFlat|intFlat|vitFlat|allStat|endSTR|endDEX|endINT|arcMageInt)/.test(a.id);
const relevant=pool.filter(resource),affixes=[...new Map(relevant.map(a=>[a.id,a])).values()];
const cases=[];
function base(id,group='단독'){return {id,group,level:1,stage:1,difficulty:0,stats:{str:0,dex:0,int:0,vit:0,grit:0},passives:{pHuman:0,pFortify:0,pVital:0,pStamina:0,pMelee:0},items:[]};}
function item(slot){return {slot,enh:0,rarity:1,tier:0,affixes:[],...(slot==='weapon'?{wtype:'sword'}:{}),...(slot==='bow'?{btype:'crossbow'}:{})};}
function affixItem(a,tier=0){
  if(a.tiers[tier]==null)tier=a.tiers.findIndex(Number.isFinite);
  if(tier<0)throw Error('유효 티어 없음: '+a.id);
  const slot=a.slots[0]==='ossuary'?'ossuary':slots.find(s=>a.slots.includes(slotMap[s]));
  if(!slot)throw Error('어픽스 슬롯 없음: '+a.id);
  const it=item(slot);if(a.brType)it.brType=a.brType;
  if(slot==='ossuary'){it.rarity=5;it._implicitStat='_iAncPow';tier=3;}
  it.affixes=[{id:a.id,value:a.tiers[tier],tier}];return it;
}
function add(c){
  ctx.P={lv:c.level,hp:1e6,mp:1e6,st:1e6,shield:1e6};ctx.G={on:true,stage:c.stage};ctx.OPT={diff:c.difficulty+5};
  ctx.STATS={str:0,dex:0,int:0,lck:0,vit:0,...c.stats};ctx._grit=c.stats.grit;
  ctx.PASSIVES={...c.passives};ctx.INV={equipped:Object.fromEntries(c.items.map(i=>[i.slot,JSON.parse(JSON.stringify(i))]))};
  run('_eqStatCache=null;_eqAffixCache=null;_lEqCache=null;applyStats()');
  if(c.items.some(i=>i.affixes.some(a=>!Number.isFinite(a.value))))throw Error('비정상 어픽스 값: '+c.id);
  c.web=Array.from(run('[P.mhp,P.mmp,P.mst,P.mshield]'));if(!c.web.every(Number.isFinite))throw Error('비정상 원문 값: '+c.id);
  cases.push(c);
}
add(base('baseline','기준'));
for(const field of ['bonusHp','bonusMp','bonusSt','bonusShield','bStr','bDex','bInt','bGrit']){
  const c=base('field:'+field),it=item(['bonusMp','bonusShield','bGrit'].includes(field)?'necklace':'armor');it[field]=20;c.items=[it];add(c);
}
for(const a of affixes){const c=base('affix:'+a.id);c.items=[affixItem(a)];add(c);}
for(const key of ['str','dex','int','vit','grit']){const c=base('sp:'+key);c.stats[key]=20;add(c);}
for(const key of Object.keys(base('').passives)){const c=base('passive:'+key);c.passives[key]=1;add(c);}
for(const [key,val,slot] of [['_iMaxHP',20,'helmet'],['_iMaxHPPct',5,'necklace'],['_iLifeHPPct',5,'bracelet']]){
  const c=base('implicit:'+key),it=item(slot);it._implicitStat=key;it._implicitVal=val;c.items=[it];add(c);
}
// SP/AP가 0일 때의 원래 CalculateStats 경로와 allocated 경로를 각각 분리한다.
{const c=base('allocated:baseline','기준');c.stats.str=1;add(c);}
for(const field of ['bGrit','bDex']){const c=base('allocated:'+field);c.stats.str=1;const it=item(field==='bGrit'?'necklace':'armor');it[field]=20;c.items=[it];add(c);}
for(const level of [1,2,3,20,99])for(const difficulty of [-5,0,5])for(const stage of [1,7]){const c=base(`profile:${level}:${difficulty}:${stage}`,'기준');Object.assign(c,{level,difficulty,stage});add(c);}
let state=0x0d5304;const seed=state,rnd=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
for(let n=0;n<360;n++){
  const c=base('mixed:'+n,'혼합');c.level=1+n%99;c.stage=pick([1,2,7,15]);c.difficulty=pick([-5,-2,0,2,5]);
  if(n%3!==0)for(const key of Object.keys(c.stats))c.stats[key]=Math.floor(rnd()*31);
  if(n%4!==0)for(const key of Object.keys(c.passives))c.passives[key]=Math.floor(rnd()*4);
  for(const slot of slots){if(rnd()>.45)continue;const it=item(slot);
    for(const field of ['bStr','bDex','bInt','bGrit'])if(rnd()<.3)it[field]=Math.floor(rnd()*25);
    // mkItem의 기본 자원 필드 범위: 무기/활/투구에는 bonus 자원이 없다.
    if(!['weapon','bow','helmet'].includes(slot))for(const field of ['bonusHp','bonusMp','bonusSt','bonusShield'])if(rnd()<.4)it[field]=10+Math.floor(rnd()*40);
    const candidates=relevant.filter(a=>a.slots.includes(slotMap[slot])&&a.tiers[0]!=null),groups=new Set();
    for(let j=0;j<3&&candidates.length;j++){const a=pick(candidates);if(groups.has(a.group)||a.brType&&it.brType&&it.brType!==a.brType)continue;groups.add(a.group);if(a.brType)it.brType=a.brType;it.affixes.push({id:a.id,value:a.tiers[0],tier:0});}
    it.rarity=2;c.items.push(it);
  }
  add(c);
}
const out={schema:'exoduser.resource-oracle.v1',seed,resources:['HP','MP','ST','쉴드'],source:{webCommit:arg('--web-commit'),coreCommit:arg('--core-commit'),anchors},affixCoverage:affixes.map(a=>({id:a.id,slots:a.slots,tiers:a.tiers,brType:a.brType||null})),scope:{originalFunctions:true,syntheticControlledInputs:true,enhancement:false,crystals:false,sockets:false,browserRuntime:false,dropProbability:false},cases};
fs.writeFileSync(arg('--out'),JSON.stringify(out,null,2));
console.log(`웹 자원 oracle: ${cases.length}건, 자원 관련 어픽스 ${affixes.length}종, 시드 ${seed}`);
