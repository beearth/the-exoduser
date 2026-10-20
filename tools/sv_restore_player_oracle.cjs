// QA only: execute exact latest-checkout source slices in a fresh VM, detached
// P/STATS/PASSIVES/d only. Never load the game, actor, server, or storage API.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=process.argv[2],file=path.join(root,'game.html'),source=fs.readFileSync(file,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),provenance=[];
function slice(begin,end){const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('source anchor changed');const code=source.slice(a,b);provenance.push({file:'game.html',start_line:source.slice(0,a).split('\n').length,end_line:source.slice(0,b).split('\n').length,sha256:sha(code)});return code;}
const xp=slice('function _restoreExpProgress(pd){','function dbRestore(d){');
const max=slice('function _calcMaxExp(lv){','function addExp(v,trans){');
const player=slice('  P.lv=pd.lv||1; const _xpRestore=', '  P.rage=0;');
const allocation=slice('  if(d.stats)for(const k in d.stats)', '  // Quickslots (filter out removed potions)');
const clone=v=>structuredClone(v);
const current={player:{mhp:777,mmp:333,mst:222,hp:17,mp:19,st:23,rage:71,maskOn:false,untouched:{nested:[3]}},stats:{str:5,dex:4},passives:{pShield:0,pHuman:0,pDemon:0,pAtk:2}};
function evaluate(input,state){const d=clone(input),ctx=vm.createContext({d,pd:d.player,P:clone(state.player),STATS:clone(state.stats),PASSIVES:clone(state.passives),_grit:99});vm.runInContext(xp+max+player+allocation,ctx,{timeout:2000});return {plan:{player:ctx.P,stats:ctx.STATS,passives:ctx.PASSIVES,skills:d.skills??null,raw_grit:ctx._grit},after_input:d};}
const fixtures=[];
function add(id,payload,state=current){fixtures.push({id,payload,current:clone(state)});}
add('empty-player',{player:{}});
add('all-zero',{player:Object.fromEntries('lv exp maxExp sp ap transLvDate transLvCount apBossCleared goddessGift baseAtk baseDef mpR stR hp mhp mp mmp st mst speed shield mshield'.split(' ').map(k=>[k,0]))});
add('saved-bonus-no-recompute',{player:{lv:735,exp:-12,maxExp:19,sp:9021,ap:814,passiveQueue:['unknown','pAtk','pAtk',1,null,{opaque:true}],hp:120,mhp:850,mp:60,mmp:90,st:50,mst:100},stats:{str:'0',custom:[],dex:false},passives:{pAtk:'4',unknown:999},grit:4,gritCostModeV2:1});
for(const v of [null,false,0,'','0','12',[],[null],{},['pAtk'],['pAtk','pAtk'],Array(301).fill('unknown')])add('queue-'+fixtures.length,{player:{passiveQueue:v}});
for(const v of [null,false,0,'','0','12',[]])add('truthy-fallback-'+fixtures.length,{player:{lv:v,sp:v,ap:v,transLvDate:v,transLvCount:v,apBossCleared:v,goddessGift:v,hp:v,mp:v,st:v,baseAtk:v,baseDef:v,mpR:v,stR:v,speed:v,shield:v,mshield:v}});
for(const lv of [999,1000,1500,1000000,'1000','1500','bad'])for(const maxExp of [0,-2147483648,2147483647,'7','0','bad',null])add('exp-'+fixtures.length,{player:{lv,maxExp,exp:'-23'}});
for(const exp of ['17.25','0x20','0b11','0o10','\u00a0 23\ufeff','Infinity','1e400','bad',[],[null],['12'],[[]],false,-3,0])add('overflow-exp-'+fixtures.length,{player:{lv:1500,maxExp:-1,exp}});
for(const lv of [10000000000000,9007199254740991,1e100,'Infinity','1e400'])add('large-trans-level-'+fixtures.length,{player:{lv,maxExp:-1,exp:12}});
for(const cap of [100, '100', [], {}])add('exp-cap-type-'+fixtures.length,{player:{lv:1000,maxExp:cap,exp:'-23'}});
for(const level of [-3,0,1,3,4,6,9,10,11,50,2.8,'3','0x4','0b11','bad',4294967299,2147483648,-4294967293])add('refund-'+fixtures.length,{player:{sp:51,ap:5},passives:{pShield:level,pDef:level},grit:3});
for(const ap of [5,'5','0',[],[2],true,false])for(const grit of [0,1,3,2.5,'3','0x4',-1])add('order-'+fixtures.length,{player:{ap,sp:ap},passives:{pShield:3,pDef:4},skills:{humanity:'12',demonRevive:2,kiSlash:3},grit});
for(const flag of [0,1,'0','',false,true,[],{}])add('grit-flag-'+fixtures.length,{player:{sp:9},grit:'3',gritCostModeV2:flag});
add('inherited-shield',{player:{ap:20},skills:{humanity:3,demonRevive:12}}, {...clone(current),passives:{pShield:10,pHuman:4,pDemon:0}});
add('legacy-without-known-def',{player:{ap:20},passives:{pDef:3},skills:{humanity:3,demonRevive:12}});
add('string-sp-fractional-numeric-refund',{player:{sp:5},grit:2.5});
for(let n=0;n<32;n++)add('deterministic-'+n,{player:{lv:1000+n*7,maxExp:n%2?-1:5000000,exp:String(n-9),sp:n+100,ap:n%3?String(n):n,hp:n%2?0:n,mhp:350+n,mp:0,mmp:80+n,st:0,mst:100+n,passiveQueue:n%2?['pAtk','unknown',null]:{}},passives:{pShield:n%12,pDef:n%9,pAtk:String(n)},skills:{humanity:n%14,demonRevive:n%7},grit:n%6,gritCostModeV2:n%3});
const rows=[];
for(const fixture of fixtures){
 // Fractional refunds concatenated to a string require JS Number formatting;
 // the production calculation explicitly holds that unproved domain.
 if((typeof fixture.payload.player.sp==='string'||Array.isArray(fixture.payload.player.sp))&&fixture.payload.grit===2.5)continue;
 const first=evaluate(fixture.payload,fixture.current);
 const second=evaluate(fixture.payload,first.plan);
 const sameObject=evaluate(first.after_input,first.plan);
 rows.push({...fixture,expected:first.plan,expected_second:second.plan,after_input:first.after_input,expected_same_object:sameObject.plan});
}
// QA handoff tags only; these never enter a game save or production calculator.
function wire(v){if(typeof v==='number'&&!Number.isFinite(v))return {'@number':String(v)};if(typeof v==='number'&&Math.abs(v)>=1e12){const b=Buffer.alloc(8);b.writeDoubleLE(v);return {'@f64':b.toString('hex')};}if(Array.isArray(v))return v.map(wire);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,wire(x)]));return v;}
if(sha(fs.readFileSync(file,'utf8'))!==sha(source))throw Error('source changed during oracle');
console.log(JSON.stringify(wire({rows,provenance,source_hash:sha(source),source_unchanged:true,actual_save_writes:0,actual_server_calls:0,live_restore_calls:0})));
