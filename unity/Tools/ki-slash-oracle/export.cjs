// Offline original-source execution; no browser/JavaScript in the native player.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function arg(key,fallback){let i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1];}
const project=path.resolve(arg('--project',path.resolve(__dirname,'../..'))),root=path.resolve(arg('--source-root',path.join(project,'..')));
const dep=path.resolve(arg('--dependency-root',root));const acorn=require(require.resolve('acorn',{paths:[dep]}));
const source=fs.readFileSync(path.join(root,'godot/source_snapshot/game.html'),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const expected='dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209';if(hash(source)!==expected)throw Error('Source snapshot pin mismatch');
const fixture=JSON.parse(fs.readFileSync(path.join(project,'Tools/Fixtures/starter-fixture.json'),'utf8'));
const anchors=[];const ctx=vm.createContext({Math,console,fixture});const run=s=>vm.runInContext(s,ctx,{timeout:1000});
function exp(name){let m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);if(!m)throw Error(name);let n=acorn.parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});run('var '+name+'=('+source.slice(n.start,n.end)+');');anchors.push({name,line:source.slice(0,m.index).split('\n').length});}
function fun(name){let m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);if(!m)throw Error(name);let n=acorn.parseExpressionAt(source,m.index,{ecmaVersion:'latest'});run(source.slice(n.start,n.end));anchors.push({name,line:source.slice(0,m.index).split('\n').length});}
run(`var P={x:0,y:0,lv:1,baseAtk:15,facing:0,skills:{kiSlash:1}},INV={equipped:fixture.equipment},STATS={str:0},PASSIVES=new Proxy({},{get:()=>0}),_eqStatCache=null,_eqAffixCache=null,_lEqCache=null,_charIdx=0,_crescents=[],_CRES_MAX=16,_cresStep=0,_cresComboT=0,_cresCd=0,_KI_HOLD_STEP=40,_KI_HOLD_MAX=120,_KI_PARRY_WIN=20,G={hitStop:0},ens=[],packets=[],wall=false,los=true;
function _addSkProf(){}function _playKiSlashComboSfx(){}function addTxt(){}function _L(a){return a}function _T(a){return a}function shake(){}function _playKiSlashHit(){}function _hurtFieldMobs(){return false}function shQuery(){return ens}function isW(){return wall}function hasLOS(){return los}function dst(x,y,a,b){return Math.hypot(x-a,y-b)}function hurtE(e,dmg,angle,noSound,opts,el){packets.push({id:e.id,dmg,angle,noSound,opts,el})}
for(var i=0;i<16;i++)_crescents.push({active:false,trail:Array.from({length:5},()=>({x:0,y:0}))});`);
for(const n of ['SLOT_NAMES','_SK_MUL'])exp(n);
for(const n of ['wp','_uEq','_lEqRebuild','_lEq','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_lvB','_slotFlatAtk','enhMulAtk','statStr','_passDmgSum','pAtkMul','meleeRef','_skMul','_kiSlashHoldTier','_kiSlashHoldMultiplier','spawnCrescent','_fireKiSlashCrescent','updateCrescents'])fun(n);
const scenarios=[];
for(const profile of ['starter','raw'])for(const level of [1,3])for(const [step,charge] of [[1,0],[2,0],[3,0],[3,39],[3,40],[3,79],[3,80],[3,119],[3,120],[3,999]]){
run(`P.lv=1;P.skills.kiSlash=${level};P.baseAtk=${profile==='raw'?8:15};INV.equipped=${profile==='raw'?'{}':'fixture.equipment'};_eqStatCache=null;_eqAffixCache=null;for(var c of _crescents)c.active=false;_fireKiSlashCrescent(${step},${charge});`);
const packet=run('JSON.parse(JSON.stringify(_crescents.find(c=>c.active)))');
run('var travel=[];while(_crescents[0].active){updateCrescents(1);travel.push({x:_crescents[0].x,life:_crescents[0].life,active:_crescents[0].active})}');
scenarios.push({profile,level,step,charge,spawn:packet,last:run('travel[travel.length-1]'),updates:run('travel.length')});
}
run(`INV.equipped=fixture.equipment;P.baseAtk=15;P.lv=1;P.skills.kiSlash=1;_eqStatCache=null;for(var c of _crescents)c.active=false;ens=[{id:1,x:80,y:0,r:22,alive:true},{id:2,x:80,y:0,r:22,alive:true}];packets=[];wall=false;los=true;_fireKiSlashCrescent(1);for(var i=0;i<5;i++)updateCrescents(1);`);
const hits=run('JSON.parse(JSON.stringify(packets))');
run(`for(var c of _crescents)c.active=false;ens=[{id:3,x:91,y:0,r:22,alive:true}];packets=[];wall=false;los=true;_fireKiSlashCrescent(1);updateCrescents(1);var boundaryFirst=packets.length;updateCrescents(1);`);
const boundary=run('({x:91,r:22,first:boundaryFirst,second:packets.length})');
run(`for(var c of _crescents)c.active=false;packets=[];wall=true;_fireKiSlashCrescent(1);updateCrescents(1);`);
const wall=run('({active:_crescents[0].active,packets:packets.length,x:_crescents[0].x,life:_crescents[0].life})');
run(`for(var c of _crescents)c.active=false;packets=[];wall=false;los=false;_fireKiSlashCrescent(1);updateCrescents(1);`);const los=run('packets.length');
const livePath=arg('--live-source',null);let liveComparison=null;
if(livePath){const live=fs.readFileSync(livePath,'utf8');function body(text,name){const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(text);if(!m)return null;const n=acorn.parseExpressionAt(text,m.index,{ecmaVersion:'latest'});return text.slice(n.start,n.end);}const names=['spawnCrescent','_fireKiSlashCrescent','_kiSlashHoldTier','_kiSlashHoldMultiplier','_beginKiSlashThirdCharge','_updateKiSlashThirdCharge','updateCrescents','_poiseHit'];liveComparison={path:livePath,sha256:hash(live),functions:names.map(name=>({name,equals_snapshot:body(source,name)===body(live,name)}))};}
const result={schema:'exoduser.unity.ki-slash-source-oracle.v1',source:{sha256:expected,anchors},scenarios,hits,boundary,wall,blocked_los_hit_count:los,live_comparison:liveComparison,scope:{source_numeric_functions:true,hurtE_executed:false,full_game_rng:false}};
const out=arg('--out',path.join(__dirname,'oracle.json'));fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(JSON.stringify({out,scenarios:scenarios.length,starterdamage:scenarios[0].spawn.dmg,hits:hits.length,wall,los}));
