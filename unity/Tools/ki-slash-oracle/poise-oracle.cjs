const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
function arg(k,d){let i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];}
const root=arg('--source-root',null),input=arg('--source',root&&path.join(root,'godot/source_snapshot/game.html'));
if(!input)throw Error('--source required');
const text=fs.readFileSync(input,'utf8'),sha=crypto.createHash('sha256').update(text).digest('hex');
if(arg('--expect-source-sha',null)&&sha!==arg('--expect-source-sha'))throw Error('source changed');
const acorn=require(require.resolve('acorn',{paths:[arg('--dependency-root',root||__dirname)]})),anchors=[];
function statement(prefix,within=text){
 const lines=within.split(/\r?\n/),hits=lines.map((s,i)=>s.trim().startsWith(prefix)?i:-1).filter(i=>i>=0);
 if(hits.length!==1)throw Error('poise anchor '+prefix+': '+hits.length);
 const start=hits[0];
 for(let end=start;end<Math.min(lines.length,start+100);end++){
   const code=lines.slice(start,end+1).join('\n');let ast;
   try{ast=acorn.parse(code,{ecmaVersion:'latest',allowReturnOutsideFunction:true});}catch{continue;}
   if(ast.body.length!==1)throw Error('ambiguous poise statement '+prefix);
   anchors.push({prefix,code});return code;
 }
 throw Error('incomplete poise statement '+prefix);
}
const match=/function updateE\(/.exec(text);if(!match)throw Error('updateE missing');
const fn=acorn.parseExpressionAt(text,match.index,{ecmaVersion:'latest'}),update=text.slice(fn.start,fn.end);
// Keep the original 200px T2 distance and both enemy-index phases.
// Execute source timers every world frame, but source updateE only through the exact tier dispatch.
const timers=[statement('if(e.stunned>0)e.stunned-=sp;'),statement('if(e._hitStun>0)e._hitStun-=sp;'),statement('if(e.stunned<=0&&e._maxStunned)')].join('\n');
const prefix=[statement('if(e._hitStun>0)return;',update),statement('if(e.stunned>0){',update),statement('if(!e.ib && e.poise < e.maxPoise){',update)].join('\n');
const tier=statement("if(e.ib||e.hurt>0||_ed2<22500||_eCommitChg){");
const frameLines=text.split(/\r?\n/).filter(s=>s.trim().startsWith('if(!G._eTierFrame)G._eTierFrame=0;G._eTierFrame++;'));
if(frameLines.length!==1)throw Error('unique source frame counter missing');
const frameSetup=frameLines[0];anchors.push({prefix:'world-frame counter',code:frameSetup});
const ctx=vm.createContext({Math});
vm.runInContext('var G={},_ei=0,P={x:0,y:0},updateCalls=0,lastSp=0;function _cancelProjCharge(){} function _poiseReset(e){e.poise=e.maxPoise;e.poiseR=0} function _ffMoveE(){throw Error("outside T2 profile")} function updateE(e,sp){updateCalls++;lastSp=sp;'+prefix+'} function sourceFrame(e){const sp=1;'+frameSetup+'\n'+timers+'\nconst _ed2=(P.x-e.x)**2+(P.y-e.y)**2,_eCommitChg=e.s==="eChargeWind"||e.s==="eCharge";'+tier+'}',ctx);
const run=s=>vm.runInContext(s,ctx,{timeout:1000}),plain=x=>JSON.parse(JSON.stringify(x));
const scenarios=[];
for(const enemyIndex of [0,1])for(const name of ['regen','stunned','hitstun']){
 const initial={x:200,y:0,ib:false,hurt:0,s:'idle',stunned:name==='stunned'?2:name==='hitstun'?0:1,_maxStunned:name==='hitstun'?0:180,_hitStun:name==='hitstun'?2:0,poise:name==='hitstun'?25:0,maxPoise:100,poiseR:name==='hitstun'?199:0};
 ctx.initial=initial;ctx.enemyIndex=enemyIndex;run('G={};_ei=enemyIndex;e=JSON.parse(JSON.stringify(initial));updateCalls=0;lastSp=0');
 const trace=[],count=name==='regen'?400:3;
 for(let frame=1;frame<=count;frame++){
  run('sourceFrame(e)');
  const row=plain(run('({frame:G._eTierFrame,poise:e.poise,poiseR:e.poiseR,stunned:e.stunned,_hitStun:e._hitStun,updateCalls,lastSp})'));
  if(row.frame!==frame||row.updateCalls!==(enemyIndex===0?Math.floor(frame/2):Math.ceil(frame/2))||(row.updateCalls>0&&row.lastSp!==2))throw Error('T2 phase contract mismatch');
  trace.push(row);
 }
 scenarios.push({name,enemyIndex,initial,trace});
}
const pick=(name,frame)=>scenarios.find(s=>s.name===name&&s.enemyIndex===0).trace[frame-1];
const result={schema:'exoduser.unity.ordinary-poise-t2-world-frames.v2',distance:200,samplePoint:'end-of-world-frame',source:{sha256:sha,head:arg('--head',''),anchors,executed_timers:timers,executed_update_prefix:prefix,executed_tier_dispatch:tier,executed_frame_counter:frameSetup},expiry:pick('regen',1),before:pick('regen',199),at200:pick('regen',200),at400:pick('regen',400),stunned:pick('stunned',1),hitstun:pick('hitstun',1),scenarios,scope:'exact source T2 dispatch/timers/poise prefix, both phases and every frame; unrelated AI/presentation excluded, not Unity runtime'};
fs.writeFileSync(arg('--out',path.join(__dirname,'poise-oracle.json')),JSON.stringify(result,null,2));
console.log(JSON.stringify({distance:200,scenarios:scenarios.length,samples:scenarios.reduce((n,s)=>n+s.trace.length,0),expiry:result.expiry,before:result.before,at200:result.at200,at400:result.at400}));
