// C01-AI pool oracle: runs the ORIGINAL HELL_SPAWN / _HELL_CDF / _RANGED_ET / _CH1_OPENING_EXCLUDED_ET / rollEtype / _spawnHoleCount from game.html in a Node VM.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const src=arg('--source'),out=path.join(__dirname,'oracle.json');
const text=fs.readFileSync(src,'utf8'),lines=text.split('\n');
const compiles=s=>{try{new vm.Script(s);return true;}catch(e){return false;}};
function find(p){const h=[];for(let i=0;i<lines.length;i++)if(lines[i].startsWith(p))h.push(i);if(h.length!==1)throw Error(p+' matched '+h.length);return h[0];}
function stmt(p){const s=find(p);for(let e=s;e<s+80;e++){const b=lines.slice(s,e+1).join('\n');if(compiles(b))return b;}throw Error('no stmt '+p);}
function brace(p){const s=find(p);for(let e=s+1;e<lines.length;e++)if(lines[e]==='}')return lines.slice(s,e+1).join('\n');throw Error('no brace');}
const ctx=vm.createContext({});
vm.runInContext('var EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};var __seq=[],__i=0;Math.random=function(){if(__i>=__seq.length)throw new Error("exhausted");return __seq[__i++];};',ctx);
for(const b of [stmt('const CHAPTER_STAGES=['),stmt('const TOTAL_STAGES='),brace('const SI_TO_HELL=new Uint8Array'),stmt('const HELL_SPAWN=['),stmt('const _HELL_CDF='),stmt('const _RANGED_ET='),stmt('const _CH1_OPENING_EXCLUDED_ET='),brace('function rollEtype('),stmt('const SPAWN_HOLE='),stmt('function _spawnHoleCount(')])vm.runInContext(b,ctx);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const cases=[];
for(let si=0;si<35;si++)for(let k=0;k<3;k++){
  const seed=si*100+k+1,r=mulberry32(seed),seq=[];for(let i=0;i<4000;i++)seq.push(r());ctx.__seq=seq;ctx.__i=0;
  const res=[];for(let n=0;n<250;n++){const b=ctx.__i;const et=vm.runInContext('rollEtype('+si+')',ctx);res.push([et,ctx.__i-b]);}
  cases.push({si,seed,res});
}
const holes=[];for(const si of [0,1,5])for(const size of [0.3,0.5,0.55,0.8,1,0.01,0.31])holes.push([size,si,vm.runInContext('_spawnHoleCount('+size+','+si+')',ctx)]);
fs.writeFileSync(out,JSON.stringify({cases,holes,sha256:crypto.createHash('sha256').update(text).digest('hex')}));
console.log('wrote '+cases.length+' cases');
