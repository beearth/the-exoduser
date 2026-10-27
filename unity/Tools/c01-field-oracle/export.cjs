// C01 field oracle (spawn part): runs the ORIGINAL 소환굴 update block of update() (game.html "소환굴 업데이트" .. "킬 체인 타이머") for the 14 final holes of 1-1 in a Node VM while a
// scripted player walks the field, and records every summon (frame, x, y, etype), the hole removals and the Math.random() count. C# SpawnHoleSystem replays the same walk.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const src=arg('--source'),out=path.join(__dirname,'oracle.json'),holesFile=arg('--holes');
const text=fs.readFileSync(src,'utf8'),lines=text.split('\n');
const compiles=s=>{try{new vm.Script(s);return true;}catch(e){return false;}};
function find(p){const h=[];for(let i=0;i<lines.length;i++)if(lines[i].startsWith(p))h.push(i);if(h.length!==1)throw Error(p+' matched '+h.length);return h[0];}
function stmt(p){const s=find(p);for(let e=s;e<s+80;e++){const b=lines.slice(s,e+1).join('\n');if(compiles(b))return b;}throw Error('no stmt '+p);}
function brace(p){const s=find(p);for(let e=s+1;e<lines.length;e++)if(lines[e]==='}')return lines.slice(s,e+1).join('\n');throw Error('no brace');}
const hs=find('  // ═══ 소환굴 업데이트 (근접 트리거'),he=find('  // ═══ 킬 체인 타이머 + 균열 업데이트');
const HOLES='function __HOLES(sp){\n'+lines.slice(hs,he).join('\n')+'\n}';
if(!compiles(HOLES))throw Error('holes block does not compile');
const ctx=vm.createContext({});
vm.runInContext(`var EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};var __seq=[],__i=0;Math.random=function(){if(__i>=__seq.length)throw new Error("exhausted");return __seq[__i++];};
var T=40,_gameFrame=0,P={x:0,y:0},G={stage:0,spawnHoles:[],mw:200,mh:200,map:null,_aliveEns:0},ens=[],__spawns=[],__removed=[];
function isW(x,y,f){return (x>=__wall.x0&&x<=__wall.x1&&y>=__wall.y0&&y<=__wall.y1);}var __wall={x0:1,x1:0,y0:1,y1:0};
function addParts(){}function addTxt(){}function shake(){}
function mkEn(x,y,si,etype,ib,el,room){const o={x:x,y:y,etype:etype,room:room,alive:true};__spawns.push([_gameFrame,x,y,etype,room===undefined?null:room]);return o;}
`,ctx);
for(const b of [stmt('const CHAPTER_STAGES=['),stmt('const TOTAL_STAGES='),brace('const SI_TO_HELL=new Uint8Array'),stmt('const HELL_SPAWN=['),stmt('const _HELL_CDF='),stmt('const _RANGED_ET='),stmt('const _CH1_OPENING_EXCLUDED_ET='),brace('function rollEtype('),stmt('const SPAWN_HOLE='),stmt('function _spawnHoleCount('),HOLES])vm.runInContext(b,ctx);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const holes=JSON.parse(fs.readFileSync(holesFile,'utf8')).spawn_holes_final;
const scenarios=[
 {name:'park at hole 8 (5620,1820)',seed:11,walls:null,path:[[0,5360,2020]],frames:2400},
 {name:'walk the east edge',seed:12,walls:null,path:[[0,5620,6000],[500,5620,5300],[1100,5400,3300],[1700,5620,1900],[2300,4300,1100]],frames:3200},
 {name:'big hole 4020,1020 (size .8)',seed:13,walls:null,path:[[0,4020,1300]],frames:2600},
 {name:'walls around the hole force the spiral',seed:14,walls:{x0:5000,x1:6400,y0:1200,y1:2500},path:[[0,5360,2020]],frames:1600},
 {name:'walk the whole field',seed:15,walls:null,path:[[0,3000,7000],[400,2300,5700],[900,3300,4300],[1500,3100,3500],[2100,5200,3300],[2700,5600,1900],[3300,4800,1900],[3900,4000,1000]],frames:4600},
];
const results=[];
for(const sc of scenarios){
  const r=mulberry32(sc.seed),seq=[];for(let i=0;i<200000;i++)seq.push(r());
  ctx.__seq=seq;ctx.__i=0;
  vm.runInContext('__spawns=[];__removed=[];_gameFrame=0;G.stage=0;G.spawnHoles='+JSON.stringify(holes.map(h=>({x:h.x,y:h.y,size:h.size,room:h.room})))+';ens=[];G._aliveEns=0;__wall='+JSON.stringify(sc.walls||{x0:1,x1:0,y0:1,y1:0})+';G.map=Array.from({length:200},(_,ty)=>Array.from({length:200},(_,tx)=>isW((tx+.5)*40,(ty+.5)*40)?1:0));',ctx);
  const total=[];let last=null;
  for(let f=1;f<=sc.frames;f++){
    let pp=sc.path[0];for(const p of sc.path)if(f>=p[0])pp=p;
    ctx.__fx=pp[1];ctx.__fy=pp[2];
    vm.runInContext('_gameFrame='+f+';P.x=__fx;P.y=__fy;G._aliveEns=__aliveCount;__HOLES(1);',Object.assign(ctx,{__aliveCount:0}) && ctx);
  }
  const sp=JSON.parse(JSON.stringify(vm.runInContext('__spawns',ctx))),left=vm.runInContext('G.spawnHoles.length',ctx);
  results.push({sc,spawns:sp,holesLeft:left,rand:ctx.__i});
}
fs.writeFileSync(out,JSON.stringify({holes,results,sha256:crypto.createHash('sha256').update(text).digest('hex')}));
console.log('wrote '+results.length+' scenarios, spawns '+results.map(r=>r.spawns.length).join('/'));
