import fs from 'node:fs';import readline from 'node:readline';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=process.argv.find(x=>x.startsWith('--source-game='))?.slice(14);assert(source);
const names=['_fbHp','_fbMk','_fbEsca','_fbFaceFrame','_fbFireEnergy','_fbTickOne'];let code='',capture='',depth=0,line=0;const anchors={};
for await(const text of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){
 line++;if(!capture){const n=names.find(n=>text.startsWith(`function ${n}(`));if(n){capture=n;depth=0;anchors[n]=line;}}
 if(capture){code+=text+'\n';depth+=(text.match(/{/g)||[]).length-(text.match(/}/g)||[]).length;if(depth===0)capture='';}
}
assert.equal(Object.keys(anchors).length,6);
const math=Object.create(Math);let draws=0;math.random=()=>{draws++;return .5};let shots=[],can=true;
const context={Math:math,T:40,P:{lv:1,x:500,y:0,r:20,iframes:0,s:'idle',kb:{x:0,y:0}},G:{_fbAnnounced:false},_FB_HP_MUL:7.5,_FB_WAKE:1000,_FB_EN_CHG:180,EL:{I:2,F:1},ELC:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00'],dst:(x,y,a,b)=>Math.hypot(x-a,y-b),_fieldEnemyCanShoot:()=>can,_fbElCol:()=> '#3388ff',showPH(){},poolPart(){},_addTpSmoke(){},shake(){},SFX:{magic(){},detonate(){}},_loadKrakenWaterOrbClip(){},spawnProj:p=>shots.push({kind:'energy',props:p}),_emitEnemyShot:(f,p)=>shots.push({kind:'warning',props:p}),playVFXAng(){},_addBlastLight(){},_addTpBolt(){},hurtP(){throw Error('protected fixture unexpected')},addTxt(){},_T:x=>x,_fmDeathFx(){},_fbMarkDead(){}};
const ctx=vm.createContext(context);vm.runInContext(code,ctx);const fixtures=[];
for(const level of [0,1,2,100])for(const el of [2,1,3,4]){
 ctx.P.lv=level;const fb=ctx._fbMk(-.5,-.5,el);fixtures.push({kind:'make',level,el,fb});
}
const scenarios=[{}, {asleep:1,tpT:0}, {asleep:0,hid:1,tpT:1,spawnIn:1}, {asleep:0,hid:0,shotCd:0}, {asleep:0,hid:0,enChg:1,shotCd:1}, {asleep:0,hid:0,burst:3,burstGap:0,shotCd:100}, {asleep:0,hid:0,tpCd:1,shotCd:100}, {asleep:0,hid:0,tpCd:1,shotCd:100}];
for(let i=0;i<scenarios.length;i++)for(const allowed of [true,false]){
 ctx.P={lv:1,x:i===1?1000.001:i===7?2200:500,y:0,r:20,iframes:0,s:'idle',kb:{x:0,y:0}};let fb=ctx._fbMk(-.5,-.5,2);Object.assign(fb,scenarios[i]);const before=JSON.parse(JSON.stringify(fb));draws=0;shots=[];can=allowed;ctx._fbTickOne(fb);fixtures.push({kind:'tick',fb:before,p:ctx.P,can:allowed,after:fb,shots,draws});
}
ctx.P={lv:1,x:500,y:0,r:20,iframes:0,s:'idle',kb:{x:0,y:0}};let fb=ctx._fbMk(-.5,-.5,3);can=true;
for(let i=0;i<430;i++){const before=JSON.parse(JSON.stringify(fb));draws=0;shots=[];ctx._fbTickOne(fb);fixtures.push({kind:'tick',fb:before,p:ctx.P,can:true,after:JSON.parse(JSON.stringify(fb)),shots:JSON.parse(JSON.stringify(shots)),draws});}
for(const p of [{x:1000,y:0},{x:-500,y:200},{x:-500,y:-200},{x:-500,y:300},{x:500,y:-700}]){
 ctx.P={lv:1,...p,r:20,iframes:0,s:'idle',kb:{x:0,y:0}};let f=ctx._fbMk(-.5,-.5,2);if(p.x<0||p.y!==0)Object.assign(f,{asleep:0,hid:0,t:31,shotCd:100});const before=JSON.parse(JSON.stringify(f));draws=0;shots=[];can=true;ctx._fbTickOne(f);fixtures.push({kind:'tick',fb:before,p:ctx.P,can:true,after:f,shots,draws});
}
console.log(JSON.stringify({anchors,fixtures}));
