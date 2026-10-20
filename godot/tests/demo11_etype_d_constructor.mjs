import fs from 'node:fs';import readline from 'node:readline';import vm from 'node:vm';import assert from 'node:assert/strict';
const opt=n=>process.argv.find(x=>x.startsWith(n+'='))?.slice(n.length+1);const path=opt('--source-game');const fixtures=JSON.parse(fs.readFileSync(opt('--fixture-file'),'utf8'));
const funcs=['mkEn','_assignMobSkin','_enemyHpPacing'];const arrays=['ETYPE_HP','ETYPE_ATK','ETYPE_POISE','_ETYPE_SPD_RAW','ETYPE_R','ETYPE_COL'];let code='',capture='',depth=0;
for await(const line of readline.createInterface({input:fs.createReadStream(path),crlfDelay:Infinity})){
 if(!capture){const f=funcs.find(n=>line.startsWith('function '+n+'('));const a=arrays.find(n=>line.startsWith('const '+n+'='));if(f)capture='fn';else if(a)capture='array';else continue;depth=0}
 code+=line+'\n';if(capture==='fn'){depth+=(line.match(/{/g)||[]).length-(line.match(/}/g)||[]).length;if(depth===0)capture=''}else if(line.includes('];'))capture='';
}
code+='\nconst ETYPE_SPD=_ETYPE_SPD_RAW.map(v=>v===0?0:Math.max(.2,v*1.3));';let assertions=0;
for(const f of fixtures){let cursor=0;const M=Object.create(Math);M.random=()=>{assert(cursor<f.draws.length);return f.draws[cursor++]};
 const context={Math:M,P:{lv:f.player_level},G:{stage:0,_stageDiffOff:f.stage_offset},OPT:{diff:f.diff},DIFF_MUL:[.45,.55,.65,.76,.88,1,1.12,1.25,1.4,1.58,1.78],DIFF_LV_OFF:[-500,-400,-300,-200,-100,0,100,200,300,400,500],STG:[{monLv:100}],ELITE_TIERS:[{hpMul:1,atkMul:1,scaleMul:1}],ETYPE_ERES:Array.from({length:120},()=>[0,0,0,0,0,0,0]),ELC:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ff88cc'],SI_TO_HELL:[0],_CH1_OPENING_EXCLUDED_ET:new Set([2,22,30,43]),_useGPU:false,_useGL:false,_MOB8_TOTAL:40,_MOB8_COLS:8,canMv:()=>true,isRareEtype:()=>false,rollElite:()=>M.random()<.03?1:0,rollMods:()=>{throw Error('elite fixture unexpected')}};
 context.window=context;const c=vm.createContext(context);vm.runInContext(code,c);const n=c.mkEn(f.x,f.y,0,f.etype,false,f.element===-1?undefined:f.element,-1);
 for(const key of ['hp','mhp','atk','r','speed','poise','maxPoise','st2','facing','projT','slamCd','slamT','_iceSlimeCd','_iceSlimeT','bossPatT','_bossOrbitAng','_erraticAng']){assert.equal(n[key],f.actual[key],`etype${f.etype}:${key}`);assertions++}
 assert.equal(cursor,f.draws.length);assertions++;
}
console.log(JSON.stringify({assertions,failures:0,constructors:fixtures.length,original_mkEn:true}));
