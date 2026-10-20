'use strict';
const fs=require('node:fs'),vm=require('node:vm'),readline=require('node:readline'),crypto=require('node:crypto');
(async()=>{
 const [source,target]=process.argv.slice(2);if(!source||!target)throw Error('source and UTF-8 output path required');
 const pins=[[31960,31996],[45512,45512],[46455,46456],[46711,46711]];let n=0;const parts=pins.map(()=>[]),h=crypto.createHash('sha256');
 for await(const chunk of fs.createReadStream(source))h.update(chunk);
 for await(const line of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){n++;pins.forEach(([a,b],i)=>{if(n>=a&&n<=b)parts[i].push(line)})}
 const hash=h.digest('hex');if(hash!=='4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4')throw Error('source pin mismatch');
 const ctx={P:{skills:{}},_gxFiring:false,PASSIVES:{},G:{mats:1000},_isFused:()=>false,_cdRed:()=>0,_malCost:v=>Math.max(1,Math.ceil(v*.5)),srcId:'giantSlam',pBowCost:()=>1,pAtkCost:()=>ctx.discount,pMeleeStCost:()=>1,pMagicCost:()=>ctx.magic,_eqAffix:()=>0};vm.createContext(ctx);vm.runInContext(parts[0].join('\n'),ctx);
 const rows=[];for(const lv of [1,2,10,100])for(const mst of [40,100,500])for(const discount of [1,.6,.3])for(const red of [0,-.2]){
  Object.assign(ctx,{discount,magic:.6});ctx.P={skills:{giantSlam:lv,iceOrb:lv},mst};ctx.slv=lv;ctx._cdRed=()=>red;ctx.G.mats=1000;
  vm.runInContext('{'+parts[1].join('\n')+'\n'+parts[2].join('\n')+'\n'+parts[3].join('\n')+'\n}',ctx);
  rows.push({lv,mst,context:{ready:true,st_discount:discount,magic_cost:.6,cd_red:red},giant_st:vm.runInContext("stCost('giantSlam')",ctx),ice_mp:vm.runInContext("mpCost('iceOrb')",ctx),giant_cd:ctx.P._gslCd,spike_cd:ctx.P._gcCd,dome_cd:ctx.P._hdCd});
 }
 fs.writeFileSync(target,JSON.stringify({source_sha256:hash,rows}),'utf8');console.log(JSON.stringify({cases:rows.length,source_sha256:hash}));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
