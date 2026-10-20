import fs from 'node:fs';import readline from 'node:readline';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=process.argv.find(x=>x.startsWith('--source-game='))?.slice(14);assert(source);
const names=['_wmMkAt','_wmLockDest','_wmAppear','_wmVanish','_wmFire','_wmTick','_pushOutsideBonfire','_fmCanHit','_fmApply','_fmXY'];let code='',capture='',depth=0,line=0;const anchors={};
for await(const text of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){
 line++;if(!capture){const n=names.find(n=>text.startsWith(`function ${n}(`));if(n){capture=n;depth=0;anchors[n]=line;}}
 if(capture){code+=text+'\n';depth+=(text.match(/{/g)||[]).length-(text.match(/}/g)||[]).length;if(depth===0)capture='';}
}
assert.equal(Object.keys(anchors).length,names.length);
let draws=0,shots=[],visible=true,wall=false;const math=Object.create(Math);math.random=()=>{draws++;return .5};
const ctx=vm.createContext({Math:math,P:{lv:1,x:500,y:0,r:20,hp:220,iframes:1,s:'idle',kb:{x:0,y:0}},G:{on:true,map:{},stage:0,_wmStage:0,_bossArena:false,_bonfire:null,_worms:[]},_FDG_RUINED_FOREST_FIRST:false,window:{},_DEMO_MODE:true,_DEMO_LAST_STAGE:0,_WM_COUNT:4,_WM_WAKE:1000,EL:{F:1},_fieldEnemyCanShoot:()=>visible,isW:()=>wall,dst:(x,y,a,b)=>Math.hypot(x-a,y-b),spawnProj:p=>shots.push(p),SFX:{magic(){}},_addTpSmoke(){},poolPart(){},_addTpImpact(){},shake(){},addTxt(){},addParts(){},_T:x=>x,_fmDeathFx(){},_wmContactHit(){throw Error('protected contact in non-contact fixture')}});vm.runInContext(code,ctx);let fixtures=[];
for(const level of [0,1,2,100])for(const asleep of [false,true]){ctx.P.lv=level;fixtures.push({kind:'initial',level,asleep,w:ctx._wmMkAt(0,0,asleep)})}
ctx.P.lv=1;
for(const special of [null,{t:10,r:60,x:0,y:0}])for(const blocked of [false,true]){
 ctx.G._bonfire=special;wall=blocked;const w=ctx._wmMkAt(0,0,true);ctx.G._worms=[w];ctx.P.x=500;ctx.P.y=0;visible=true;
 for(let i=0;i<650;i++){
  const before=JSON.parse(JSON.stringify(w));shots=[];draws=0;ctx._wmTick();fixtures.push({kind:'tick',before,p:JSON.parse(JSON.stringify(ctx.P)),bonfire:special,wall:blocked,can:true,after:JSON.parse(JSON.stringify(w)),shots:JSON.parse(JSON.stringify(shots)),draws});
 }
}
for(const x of [1000,1000.001,-16,16,-16.001,16.001]){
 const w=ctx._wmMkAt(0,0,true);if(Math.abs(x)<100){w.asleep=0;w.phase='shoot';w.frame=5;w.shotF=5;w.face=x<0?0:1;w.ft=1}ctx.G._bonfire=null;ctx.G._worms=[w];ctx.P.x=x;wall=false;shots=[];draws=0;const before=JSON.parse(JSON.stringify(w));ctx._wmTick();fixtures.push({kind:'tick',before,p:JSON.parse(JSON.stringify(ctx.P)),bonfire:null,wall:false,can:true,after:JSON.parse(JSON.stringify(w)),shots:JSON.parse(JSON.stringify(shots)),draws});
}
for(const hp of [1,195])for(const cd of [0,8])for(const damage of [-5,0,1,1.9,9999]){
 const w=ctx._wmMkAt(0,0,false);w.hp=hp;w.hitCd=cd;const before=JSON.parse(JSON.stringify(w));const accepted=ctx._fmApply(w,damage,false);fixtures.push({kind:'hit',before,damage,accepted,after:JSON.parse(JSON.stringify(w))});
}
console.log(JSON.stringify({anchors,fixtures}));
