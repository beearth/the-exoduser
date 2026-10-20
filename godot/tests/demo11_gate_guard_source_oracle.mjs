import fs from 'node:fs';import readline from 'node:readline';import vm from 'node:vm';
const get=k=>process.argv.find(a=>a.startsWith(k+'='))?.slice(k.length+1);const file=get('--source-game'),out=get('--out');if(!file||!out)throw Error('source-game/out required');
let n=0,s='';for await(const l of readline.createInterface({input:fs.createReadStream(file),crlfDelay:Infinity})){n++;if([[16911,16946],[20049,20094],[20119,20119],[31620,31628],[42818,42819],[9272,9276],[14336,14336],[23292,23304],[30823,30920],[30992,30992],[31033,31037],[31119,31363]].some(([a,b])=>n>=a&&n<=b))s+=l+'\n';}
function fn(name){let a=s.indexOf('function '+name+'('),b=s.indexOf('{',a),depth=0;if(a<0)throw Error(name);for(let i=b;i<s.length;i++){if(s[i]==='{')depth++;if(s[i]==='}'&&--depth===0)return s.slice(a,i+1);}throw Error('fn '+name);}
function stmt(name){const a=s.indexOf('const '+name+'=');if(a<0)throw Error(name);let depth=0,quote='';for(let i=s.indexOf('=',a)+1;i<s.length;i++){let c=s[i];if(quote){if(c===quote&&s[i-1]!=='\\')quote='';continue;}if(c==="'"||c==='"'){quote=c;continue;}if(c==='['||c==='{'||c==='(')depth++;if(c===']'||c==='}'||c===')')depth--;if(c===';'&&depth===0)return s.slice(a,i+1);}throw Error('stmt '+name);}
const c={P:{lv:1},G:{stage:0,_stageDiffOff:0},OPT:{diff:5},STG:[{monLv:100}],SI_TO_HELL:[0],ELC:[],EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},_useGPU:false,_useGL:false,_ESPRITES:{},isRareEtype:()=>false,rollElite:()=>0,rollMods:()=>[],canMv:()=>true,Math:Object.create(Math)};c.window=c;c.Math.random=()=>.25;vm.createContext(c);
vm.runInContext(['DIFF_LV_OFF','DIFF_MUL','ETYPE_ERES','ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_SPD','ETYPE_R','ETYPE_POISE','ETYPE_COL','_MOB8_TOTAL','ELITE_TIERS','_CH1_OPENING_EXCLUDED_ET'].map(stmt).join('\n')+'\n'+['_enemyHpPacing','_assignMobSkin','mkEn'].map(fn).join('\n'),c);

const fixture=JSON.parse(fs.readFileSync(get('--fixture'),'utf8'));
c.P.lv=fixture.lv;c.OPT.diff=5;c.Math.random=()=>.5;c.at=fixture.at;c.captured=[];
c._FDG_DRUID_THORN_FIRST=false;c.ens=[];c._gameFrame=10;c.G._shotWarnings=[];c.spawnProj=p=>c.fired.push(p);c.fired=[];
vm.runInContext(['_projectileParryClass','_prepareDarkSphere','_emitEnemyShot','_tickEnemyShotWarnings','_beanRoll','_eMouthXY','eProjAt','_spawnBossProjectile'].map(fn).join('\n'),c);
vm.runInContext('gg=mkEn(at[0],at[1],0,29,false,0,-1);',c);
const forced=s.split('\n').filter(l=>/^\s*gg\.(hp|mhp|atk|baseAtk|r|poise|maxPoise|elite|_isGateGuard|dropTier)/.test(l)).join('\n');
if(!forced.includes('gg.hp=')||!forced.includes('gg.dropTier='))throw Error('forced source slice missing');
vm.runInContext('si=0;'+forced,c);
const keys=['etype','lv','hp','mhp','atk','r','speed','poise','maxPoise','eShield','eShieldMax','st2','facing','projT','projCd','_iceSlamT','_iceSlamCd','elite','_isGateGuard','dropTier','el'];
const constructor=Object.fromEntries(keys.map(k=>[k,c.gg[k]]));
c.e=c.gg;c.e.s='eSlamWind';vm.runInContext('for(let i=0;i<8;i++)eProjAt(e,Math.PI*2*i/8,3,1.2,EL.I,300,"#4455aa",2)',c);
const attack=c.G._shotWarnings.flatMap(w=>w.shots);c.G._shotWarnings=[];c._gameFrame++;c.e.alive=false;vm.runInContext('const sourceEmit=_emitEnemyShot;_emitEnemyShot=(e,p)=>{captured.push({...p});return sourceEmit(e,p)}',c);let cursor=0;c.Math.random=()=>fixture.units[cursor++];
const deathLines=s.split('\n');const deathStart=deathLines.findIndex(l=>l.includes('const _iR7=Math.random()'));const deathLine=deathLines.slice(deathStart,deathStart+2).join('\n');
if(!deathLine)throw Error('death source line missing');vm.runInContext(deathLine,c);
vm.runInContext('_tickEnemyShotWarnings(60)',c);fs.writeFileSync(out,JSON.stringify({constructor,attack,death:c.captured,death_emit_order:c.fired,draws:cursor}));
console.log('GATE_SOURCE_ORACLE '+JSON.stringify({constructor:true,attack:attack.length,death:c.captured.length,draws:cursor}));
