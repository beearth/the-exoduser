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
// Exact admitted runtime-loop statements followed by updateE's early-return and
// normal poise branch. Unrelated audio/AI/presentation owners are not executed.
const source=[statement('if(e.stunned>0)e.stunned-=sp;'),statement('if(e._hitStun>0)e._hitStun-=sp;'),statement('if(e.stunned<=0&&e._maxStunned)'),statement('if(e._hitStun>0)return;',update),statement('if(e.stunned>0){',update),statement('if(!e.ib && e.poise < e.maxPoise){',update)].join('\n');
const ctx=vm.createContext({Math});vm.runInContext('function _cancelProjCharge(){} function _poiseReset(e){e.poise=e.maxPoise;e.poiseR=0} function sourceFrame(e){const sp=1;'+source+'}\nvar e={ib:false,stunned:1,_maxStunned:180,_hitStun:0,poise:0,maxPoise:100,poiseR:0};',ctx);
const run=s=>vm.runInContext(s,ctx);run('sourceFrame(e)');const expiry=run('JSON.parse(JSON.stringify(e))');run('for(var i=0;i<198;i++)sourceFrame(e)');const before=run('JSON.parse(JSON.stringify(e))');run('sourceFrame(e)');const at200=run('JSON.parse(JSON.stringify(e))');run('for(var i=0;i<200;i++)sourceFrame(e)');const at400=run('JSON.parse(JSON.stringify(e))');
run('e={ib:false,stunned:2,_maxStunned:180,_hitStun:0,poise:0,maxPoise:100,poiseR:0};sourceFrame(e)');const stunned=run('JSON.parse(JSON.stringify(e))');
run('e={ib:false,stunned:0,_maxStunned:0,_hitStun:2,poise:25,maxPoise:100,poiseR:199};sourceFrame(e)');const hitstun=run('JSON.parse(JSON.stringify(e))');
const result={schema:'exoduser.unity.ordinary-poise-runtime-prefix.v1',source:{sha256:sha,head:arg('--head',''),anchors,executed_prefix:source},expiry,before,at200,at400,stunned,hitstun,scope:'exact source timer/early-return/ordinary-regen prefix; not whole updateE or Unity runtime'};fs.writeFileSync(arg('--out',path.join(__dirname,'poise-oracle.json')),JSON.stringify(result,null,2));console.log(JSON.stringify({expiry,before,at200,at400,stunned,hitstun}));
