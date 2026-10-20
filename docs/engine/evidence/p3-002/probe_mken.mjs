import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1600,height:900} });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:3333/game.html',{waitUntil:'commit',timeout:30000});
await p.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof initStage==='function'&&typeof FIXED_MAPS!=='undefined'&&FIXED_MAPS[0],null,{timeout:60000,polling:200});
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>{
  if(!P)P=mkP(); G.stage=0; initStage(0); OPT.diff=5;
  const out={pool:[],mk:{},elite:{},rollEtype:[]};
  const orig=Math.random;
  const pool=HELL_SPAWN[0].filter(([et])=>!_CH1_OPENING_EXCLUDED_ET.has(et));
  out.pool=pool; out.ranged=[..._RANGED_ET];
  const fieldsOf=(e)=>{const o={};for(const k in e){const v=e[k];if(typeof v==='number')o[k]=v}return o};
  for(const [et] of pool){
    let n=0;const vals=[];Math.random=()=>{const v=(n===0?0.5:(n+1)/1000);n++;vals.push(v);return v};
    const e=mkEn(3780,6220,0,et,false,undefined,1);
    Math.random=orig;
    out.mk[et]={draws:n,fields:e?fieldsOf(e):null,el:e?String(e.el):'null',mods:e?e.mods:null,col:e?e.col:null};
  }
  // elite magic case etype0 and 47
  for(const et of [0,47]){
    let n=0;Math.random=()=>{const v=(n===0?0.01:(n+1)/1000);n++;return v};
    const e=mkEn(3780,6220,0,et,false,undefined,1);Math.random=orig;
    out.elite[et]={draws:n,elite:e.elite,mods:e.mods,hp:e.hp,atk:e.atk,projCd:e.projCd,r:e.r};
  }
  // rollEtype sequences
  for(const seq of [[0.1,0.0],[0.1,0.999],[0.9,0.0],[0.9,0.5],[0.9,0.999],[0.4999,0.3],[0.5,0.3]]){
    let n=0;Math.random=()=>seq[n++];const et=rollEtype(0);Math.random=orig;out.rollEtype.push({seq,et,n});
  }
  out.spd={};out.R={};for(const [et] of pool){out.spd[et]=ETYPE_SPD[et];out.R[et]=ETYPE_R[et]}
  out.noProj=Object.keys(window._noProjEtypes||{});
  out.diff={mul:DIFF_MUL[5],off:DIFF_LV_OFF[5]};
  return out;
});
console.log(JSON.stringify(r));
console.error('errors:', errs.slice(0,5));
await b.close();
